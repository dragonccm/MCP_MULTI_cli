import { useState, useCallback } from 'react';
import type { z } from 'zod/v4';

type FormErrors<T> = Partial<Record<keyof T, string>>;

export function useForm<T extends Record<string, unknown>>(
  initialValues: T,
  schema?: z.ZodType<T>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setValues((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    },
    []
  );

  const validate = useCallback((): boolean => {
    if (!schema) return true;
    const result = schema.safeParse(values);
    if (result.success) {
      setErrors({});
      return true;
    }
    const fieldErrors: FormErrors<T> = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof T;
      if (key && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    setErrors(fieldErrors);
    return false;
  }, [schema, values]);

  const handleSubmit = useCallback(
    async (onSubmit: (data: T) => Promise<void>) => {
      if (!validate()) return;
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An error occurred';
        setErrors((prev) => ({ ...prev, _form: message } as FormErrors<T>));
      } finally {
        setIsSubmitting(false);
      }
    },
    [validate, values]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  return {
    values,
    errors,
    isSubmitting,
    setValue,
    validate,
    handleSubmit,
    reset,
    setValues,
    setErrors,
  };
}
