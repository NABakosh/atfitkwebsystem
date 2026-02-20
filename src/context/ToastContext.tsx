import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    type: ToastType;
    message: string;
}

interface ToastContextType {
    success: (msg: string) => void;
    error: (msg: string) => void;
    info: (msg: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const push = useCallback((type: ToastType, message: string) => {
        const id = Math.random().toString(36).slice(2);
        setToasts(prev => [...prev, { id, type, message }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
    }, []);

    const remove = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

    const icons: Record<ToastType, React.ReactNode> = {
        success: <CheckCircle size={16} />,
        error: <XCircle size={16} />,
        info: <Info size={16} />,
    };

    const colors: Record<ToastType, { bg: string; border: string; color: string }> = {
        success: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.35)', color: '#6ee7b7' },
        error: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.35)', color: '#fca5a5' },
        info: { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.35)', color: '#93c5fd' },
    };

    return (
        <ToastContext.Provider value={{
            success: (m) => push('success', m),
            error: (m) => push('error', m),
            info: (m) => push('info', m),
        }}>
            {children}

            {/* Toast container */}
            <div style={{
                position: 'fixed', bottom: 24, right: 24, zIndex: 9000,
                display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 360,
            }}>
                {toasts.map(t => (
                    <div key={t.id} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        background: colors[t.type].bg,
                        border: `1px solid ${colors[t.type].border}`,
                        borderRadius: 10,
                        padding: '12px 16px',
                        color: colors[t.type].color,
                        fontSize: 14,
                        fontFamily: 'Inter, sans-serif',
                        fontWeight: 500,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(12px)',
                        animation: 'slideIn 0.25s ease',
                    }}>
                        {icons[t.type]}
                        <span style={{ flex: 1 }}>{t.message}</span>
                        <button onClick={() => remove(t.id)} style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: 'inherit', opacity: 0.6, padding: 2, display: 'flex',
                        }}>
                            <X size={13} />
                        </button>
                    </div>
                ))}
            </div>

            <style>{`@keyframes slideIn { from { opacity:0; transform: translateX(40px); } to { opacity:1; transform: translateX(0); } }`}</style>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
}
