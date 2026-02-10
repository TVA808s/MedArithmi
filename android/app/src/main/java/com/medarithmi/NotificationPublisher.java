package com.medarithmi;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.os.Build;
import android.util.Log;

import androidx.core.app.NotificationCompat;

public class NotificationPublisher extends BroadcastReceiver {
    private static final String TAG = "NotificationPublisher";
    private static final String CHANNEL_ID = "medarithmi_heart_notifications";
    
    @Override
    public void onReceive(Context context, Intent intent) {
        Log.d(TAG, "onReceive: Broadcast received");
        
        try {
            String title = intent.getStringExtra("title");
            String message = intent.getStringExtra("message");
            
            Log.d(TAG, "onReceive: Title = " + title);
            Log.d(TAG, "onReceive: Message = " + message);
            
            if (title == null || message == null) {
                Log.e(TAG, "onReceive: No title or message found in intent");
                Log.d(TAG, "onReceive: Intent extras = " + intent.getExtras());
                return;
            }
            
            showNotification(context, title, message);
            
            // Планируем следующее уведомление на завтра в то же время
            scheduleNextNotification(context, title, message);
            
        } catch (Exception e) {
            Log.e(TAG, "onReceive error: " + e.getMessage(), e);
        }
    }
    
    private void showNotification(Context context, String title, String message) {
        try {
            Log.d(TAG, "showNotification: Creating notification");
            
            NotificationManager notificationManager = (NotificationManager) 
                context.getSystemService(Context.NOTIFICATION_SERVICE);
            
            if (notificationManager == null) {
                Log.e(TAG, "showNotification: NotificationManager is null");
                return;
            }
            
            // Создаем канал если нужно
            createNotificationChannel(context, notificationManager);
            
            // Интент для открытия приложения
            Intent appIntent = context.getPackageManager().getLaunchIntentForPackage(
                context.getPackageName()
            );
            
            PendingIntent pendingIntent = null;
            if (appIntent != null) {
                appIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                
                int flags = PendingIntent.FLAG_UPDATE_CURRENT;
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    flags |= PendingIntent.FLAG_IMMUTABLE;
                }
                
                pendingIntent = PendingIntent.getActivity(
                    context,
                    (int) System.currentTimeMillis(),
                    appIntent,
                    flags
                );
                Log.d(TAG, "showNotification: PendingIntent created");
            } else {
                Log.e(TAG, "showNotification: Could not get launch intent");
            }
            
            // Иконка
            int smallIcon = getNotificationIcon(context);
            Log.d(TAG, "showNotification: Small icon = " + smallIcon);
            
            // Создаем уведомление
            NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
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
            
            // Показываем уведомление
            int notificationId = (int) System.currentTimeMillis();
            notificationManager.notify(notificationId, notification);
            
            Log.d(TAG, "showNotification: Notification shown with ID = " + notificationId);
            
        } catch (Exception e) {
            Log.e(TAG, "showNotification error: " + e.getMessage(), e);
        }
    }
    
    private void createNotificationChannel(Context context, NotificationManager notificationManager) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = notificationManager.getNotificationChannel(CHANNEL_ID);
            if (channel == null) {
                Log.d(TAG, "createNotificationChannel: Creating new channel");
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
                Log.d(TAG, "createNotificationChannel: Channel created");
            } else {
                Log.d(TAG, "createNotificationChannel: Channel already exists");
            }
        }
    }
    
    private int getNotificationIcon(Context context) {
        try {
            int icon = context.getResources().getIdentifier(
                "ic_notification",
                "drawable",
                context.getPackageName()
            );
            
            if (icon == 0) {
                icon = context.getApplicationInfo().icon;
                Log.d(TAG, "getNotificationIcon: Using app icon");
            } else {
                Log.d(TAG, "getNotificationIcon: Using custom notification icon");
            }
            
            return icon;
        } catch (Exception e) {
            Log.e(TAG, "getNotificationIcon error: " + e.getMessage());
            return context.getApplicationInfo().icon;
        }
    }
    
    private void scheduleNextNotification(Context context, String title, String message) {
        try {
            Log.d(TAG, "scheduleNextNotification: Scheduling next notification");
            
            // Создаем интент для следующего дня
            Intent notificationIntent = new Intent(context, NotificationPublisher.class);
            notificationIntent.putExtra("title", title);
            notificationIntent.putExtra("message", message);
            
            int flags = PendingIntent.FLAG_UPDATE_CURRENT;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                flags |= PendingIntent.FLAG_IMMUTABLE;
            }
            
            PendingIntent pendingIntent = PendingIntent.getBroadcast(
                context,
                0,
                notificationIntent,
                flags
            );
            
            // Устанавливаем на завтра в это же время
            java.util.Calendar calendar = java.util.Calendar.getInstance();
            calendar.setTimeInMillis(System.currentTimeMillis());
            calendar.add(java.util.Calendar.DAY_OF_YEAR, 1);
            
            android.app.AlarmManager alarmManager = (android.app.AlarmManager) 
                context.getSystemService(Context.ALARM_SERVICE);
            
            if (alarmManager != null) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    alarmManager.setExactAndAllowWhileIdle(
                        android.app.AlarmManager.RTC_WAKEUP,
                        calendar.getTimeInMillis(),
                        pendingIntent
                    );
                } else {
                    alarmManager.set(
                        android.app.AlarmManager.RTC_WAKEUP,
                        calendar.getTimeInMillis(),
                        pendingIntent
                    );
                }
                Log.d(TAG, "scheduleNextNotification: Next notification scheduled for " + calendar.getTime());
            } else {
                Log.e(TAG, "scheduleNextNotification: AlarmManager is null");
            }
            
        } catch (Exception e) {
            Log.e(TAG, "scheduleNextNotification error: " + e.getMessage(), e);
        }
    }
}