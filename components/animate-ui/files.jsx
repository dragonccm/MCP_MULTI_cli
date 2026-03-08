'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const FolderContext = createContext(null);
const LevelContext = createContext(0);

function cx(...parts) {
  return parts.filter(Boolean).join(' ');
}

export function Files({ children, className = '' }) {
  return (
    <LevelContext.Provider value={0}>
      <div className={cx('aui-files', className)}>{children}</div>
    </LevelContext.Provider>
  );
}

export function FolderItem({ children, className = '', defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const value = useMemo(() => ({ open, setOpen }), [open]);
  return (
    <FolderContext.Provider value={value}>
      <div className={cx('aui-folder-item', open && 'open', className)}>{children}</div>
    </FolderContext.Provider>
  );
}

export function FolderTrigger({ children, className = '', disabled = false }) {
  const folder = useContext(FolderContext);
  const level = useContext(LevelContext);
  if (!folder) return null;

  return (
    <button
      type="button"
      disabled={disabled}
      className={cx('aui-folder-trigger', className)}
      style={{ '--aui-level': level }}
      onClick={() => !disabled && folder.setOpen(!folder.open)}
    >
      <span className={cx('aui-caret', folder.open && 'open')}>▸</span>
      <span className="aui-folder-title">{children}</span>
    </button>
  );
}

export function FolderContent({ children, className = '' }) {
  const folder = useContext(FolderContext);
  const level = useContext(LevelContext);
  if (!folder) return null;

  return (
    <AnimatePresence initial={false}>
      {folder.open ? (
        <motion.div
          className={cx('aui-folder-content', className)}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          <div className="aui-folder-content-inner">
            <LevelContext.Provider value={level + 1}>{children}</LevelContext.Provider>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function SubFiles({ children, className = '' }) {
  return <div className={cx('aui-subfiles', className)}>{children}</div>;
}

export function FileItem({ children, className = '', as: Component = 'div', ...props }) {
  const level = useContext(LevelContext);
  return (
    <Component className={cx('aui-file-item', className)} style={{ '--aui-level': level }} {...props}>
      {children}
    </Component>
  );
}
