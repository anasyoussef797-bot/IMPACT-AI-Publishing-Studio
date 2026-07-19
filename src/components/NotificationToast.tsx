/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { usePublishingStore } from '../store/publishingStore';
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export default function NotificationToast() {
  const { notifications, clearNotification } = usePublishingStore();

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-md w-full pointer-events-none">
      <AnimatePresence>
        {notifications.map((notif) => {
          const Icon = {
            success: CheckCircle,
            info: Info,
            warning: AlertTriangle,
            error: AlertCircle,
          }[notif.type];

          const colorClasses = {
            success: 'bg-emerald-50 border-emerald-200 text-emerald-800 shadow-emerald-100',
            info: 'bg-slate-50 border-slate-200 text-slate-800 shadow-slate-100',
            warning: 'bg-amber-50 border-amber-200 text-amber-800 shadow-amber-100',
            error: 'bg-rose-50 border-rose-200 text-rose-800 shadow-rose-100',
          }[notif.type];

          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg border shadow-lg ${colorClasses}`}
            >
              <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1 text-sm font-medium leading-relaxed">
                {notif.message}
              </div>
              <button
                onClick={() => clearNotification(notif.id)}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
