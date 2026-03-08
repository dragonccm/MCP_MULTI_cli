import { useState, useCallback } from 'react';
import { z } from 'zod';

interface UseFormOptions<T extends z.ZodType> {
  schema: T;
  initialValues: z.infer<T>;
  onSubmit: (values: z.infer<T>) => Promise<void>;
}

interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  submitError: string | null;
}

export function useForm<T extends z.ZodType>({
  schema,
  initialValues,
  onSubmit,
}: UseFormOptions<T>) {
  type FormValues = z.infer<T>;

  const [state, setState] = useState<FormState<FormValues>>({
    values: initialValues,
    errors: {},
    isSubmitting: false,
    submitError: null,
  });

  const setValue = useCallback(<K extends keyof FormValues>(field: K, value: FormValues[K]) => {
    setState((prev) => ({
      ...prev,
      values: { ...prev.values, [field]: value },
      errors: { ...prev.errors, [field]: undefined },
      submitError: null,
    }));
  }, []);

  const setValues = useCallback((values: Partial<FormValues>) => {
    setState((prev) => ({
      ...prev,
      values: { ...prev.values, ...values },
      submitError: null,
    }));
  }, []);

  const validate = useCallback((): boolean => {
    const result = schema.safeParse(state.values);
    if (result.success) {
      setState((prev) => ({ ...prev, errors: {} }));
      return true;
    }

    const fieldErrors: Partial<Record<keyof FormValues, string>> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as keyof FormValues;
      if (!fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }
    setState((prev) => ({ ...prev, errors: fieldErrors }));
    return false;
  }, [schema, state.values]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;

    setState((prev) => ({ ...prev, isSubmitting: true, submitError: null }));
    try {
      await onSubmit(state.values);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Đã xảy ra lỗi';
      setState((prev) => ({ ...prev, submitError: message }));
    } finally {
      setState((prev) => ({ ...prev, isSubmitting: false }));
    }
  }, [validate, onSubmit, state.values]);

  const reset = useCallback(() => {
    setState({
      values: initialValues,
      errors: {},
      isSubmitting: false,
      submitError: null,
    });
  }, [initialValues]);

  return {
    values: state.values,
    errors: state.errors,
    isSubmitting: state.isSubmitting,
    submitError: state.submitError,
    setValue,
    setValues,
    validate,
    handleSubmit,
    reset,
  };
}
