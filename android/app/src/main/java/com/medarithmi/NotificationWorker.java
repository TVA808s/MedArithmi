package com.medarithmi;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.os.Build;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

public class NotificationWorker extends Worker {
    private static final String TAG = "NotificationWorker";
    private static final String CHANNEL_ID = "medarithmi_heart_notifications";
    
    public NotificationWorker(@NonNull Context context, @NonNull WorkerParameters params) {
        super(context, params);
    }
    
    @NonNull
    @Override
    public Result doWork() {
        Log.d(TAG, "NotificationWorker started");
        
        try {
            // Получаем данные из параметров
            String title = getInputData().getString("title");
            String message = getInputData().getString("message");
            
            if (title == null || message == null) {
                Log.e(TAG, "No title or message provided");
                return Result.failure();
            }
            
            Log.d(TAG, "Showing notification: " + title);
            showNotification(title, message);
            
            // Планируем следующее уведомление
            scheduleNextNotification();
            
            return Result.success();
            
        } catch (Exception e) {
            Log.e(TAG, "Error in NotificationWorker", e);
            return Result.failure();
        }
    }
    
    private void showNotification(String title, String message) {
        try {
            NotificationManager notificationManager = (NotificationManager) 
                getApplicationContext().getSystemService(Context.NOTIFICATION_SERVICE);
            
            if (notificationManager == null) {
                Log.e(TAG, "NotificationManager is null");
                return;
            }
            
            createNotificationChannel(notificationManager);
            
            Intent appIntent = getApplicationContext().getPackageManager().getLaunchIntentForPackage(
                getApplicationContext().getPackageName()
            );
            
            PendingIntent pendingIntent = null;
            if (appIntent != null) {
                appIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                
                int flags = PendingIntent.FLAG_UPDATE_CURRENT;
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    flags |= PendingIntent.FLAG_IMMUTABLE;
                }
                
                pendingIntent = PendingIntent.getActivity(
                    getApplicationContext(),
                    (int) System.currentTimeMillis(),
                    appIntent,
                    flags
                );
            }
            
            int smallIcon = getApplicationContext().getResources().getIdentifier(
                "ic_notification",
                "drawable",
                getApplicationContext().getPackageName()
            );
            
            if (smallIcon == 0) {
                smallIcon = getApplicationContext().getApplicationInfo().icon;
            }
            
            NotificationCompat.Builder builder = new NotificationCompat.Builder(getApplicationContext(), CHANNEL_ID)
                .setSmallIcon(smallIcon)
                .setContentTitle(title)
                .setContentText(message)
                .setAutoCancel(true)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setDefaults(Notification.DEFAULT_ALL)
                .setColor(Color.parseColor("#FF6B6B"));
            
            if (pendingIntent != null) {
                builder.setContentIntent(pendingIntent);
            }
            
            Notification notification = builder.build();
            
            int notificationId = (int) System.currentTimeMillis();
            notificationManager.notify(notificationId, notification);
            
            Log.d(TAG, "Notification shown successfully");
            
        } catch (Exception e) {
            Log.e(TAG, "Error showing notification", e);
        }
    }
    
    private void createNotificationChannel(NotificationManager notificationManager) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = notificationManager.getNotificationChannel(CHANNEL_ID);
            if (channel == null) {
                channel = new NotificationChannel(
                    CHANNEL_ID,
                    "MedArithmi - Здоровье сердца",
                    NotificationManager.IMPORTANCE_HIGH
                );
                channel.setDescription("Напоминания о контроле пульса и тренировках");
                channel.enableLights(true);
                channel.setLightColor(Color.RED);
                channel.enableVibration(true);
                channel.setVibrationPattern(new long[]{0, 300, 200, 300});
                notificationManager.createNotificationChannel(channel);
            }
        }
    }
    
    private void scheduleNextNotification() {
        try {
            // Получаем данные для следующего уведомления
            String nextTitle = getInputData().getString("title");
            String nextMessage = getInputData().getString("message");
            
            if (nextTitle == null || nextMessage == null) {
                Log.e(TAG, "No data for next notification");
                return;
            }
            
            // Здесь можно планировать следующее уведомление через WorkManager
            // Но обычно для ежедневных уведомлений используют PeriodicWorkRequest
            
        } catch (Exception e) {
            Log.e(TAG, "Error scheduling next notification", e);
        }
    }
}