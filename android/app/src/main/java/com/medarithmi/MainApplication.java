package com.medarithmi;

import android.app.Application;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.os.Build;

import androidx.core.app.NotificationCompat;
import androidx.work.Constraints;
import androidx.work.Data;
import androidx.work.ExistingPeriodicWorkPolicy;
import androidx.work.PeriodicWorkRequest;
import androidx.work.WorkManager;

import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactNativeHost;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.uimanager.ViewManager;
import com.facebook.soloader.SoLoader;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Calendar;
import java.util.concurrent.TimeUnit;

// Нативный модуль для уведомлений
class NotificationModule extends ReactContextBaseJavaModule {
    private static final String CHANNEL_ID = "medarithmi_heart_notifications";
    private static final String WORKER_TAG = "daily_notification_worker";
    private final ReactApplicationContext reactContext;
    private NotificationManager notificationManager;
    private int notificationId = 1000;

    public NotificationModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        this.notificationManager = (NotificationManager) 
            reactContext.getSystemService(Context.NOTIFICATION_SERVICE);
        createNotificationChannel();
    }

    @Override
    public String getName() {
        return "NotificationModule";
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
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

    @ReactMethod
    public void showNotification(String title, String message, Promise promise) {
        try {
            notificationId++;
            
            Intent intent = reactContext.getPackageManager().getLaunchIntentForPackage(
                reactContext.getPackageName()
            );
            
            if (intent != null) {
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                
                int flags = PendingIntent.FLAG_UPDATE_CURRENT;
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    flags |= PendingIntent.FLAG_IMMUTABLE;
                }
                
                PendingIntent pendingIntent = PendingIntent.getActivity(
                    reactContext,
                    notificationId,
                    intent,
                    flags
                );

                int smallIcon = reactContext.getResources().getIdentifier(
                    "ic_notification",
                    "drawable",
                    reactContext.getPackageName()
                );
                
                if (smallIcon == 0) {
                    smallIcon = reactContext.getApplicationInfo().icon;
                }

                Notification notification = new NotificationCompat.Builder(reactContext, CHANNEL_ID)
                    .setSmallIcon(smallIcon)
                    .setContentTitle(title)
                    .setContentText(message)
                    .setContentIntent(pendingIntent)
                    .setAutoCancel(true)
                    .setPriority(NotificationCompat.PRIORITY_HIGH)
                    .setDefaults(Notification.DEFAULT_ALL)
                    .setColor(Color.parseColor("#FF6B6B"))
                    .build();

                notificationManager.notify(notificationId, notification);
                
                promise.resolve(notificationId);
            } else {
                promise.reject("ERROR", "Не удалось создать интент приложения");
            }
            
        } catch (Exception e) {
            promise.reject("NOTIFICATION_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void scheduleDailyNotification(String title, String message, int hour, int minute, Promise promise) {
        try {
            // Отменяем предыдущую задачу
            cancelScheduledNotification(promise);
            
            // Рассчитываем начальную задержку до указанного времени
            Calendar calendar = Calendar.getInstance();
            calendar.set(Calendar.HOUR_OF_DAY, hour);
            calendar.set(Calendar.MINUTE, minute);
            calendar.set(Calendar.SECOND, 0);
            
            long currentTime = System.currentTimeMillis();
            long scheduledTime = calendar.getTimeInMillis();
            
            // Если время уже прошло, планируем на завтра
            if (scheduledTime <= currentTime) {
                calendar.add(Calendar.DAY_OF_YEAR, 1);
                scheduledTime = calendar.getTimeInMillis();
            }
            
            long initialDelay = scheduledTime - currentTime;
            
            // Подготавливаем данные для Worker
            Data inputData = new Data.Builder()
                .putString("title", title)
                .putString("message", message)
                .build();
            
            // Ограничения (можно добавить требование зарядки или WiFi)
            Constraints constraints = new Constraints.Builder()
                .setRequiresBatteryNotLow(true)
                .build();
            
            // Создаем периодическую задачу (каждые 24 часа)
            PeriodicWorkRequest notificationWork = new PeriodicWorkRequest.Builder(
                NotificationWorker.class,
                24, // интервал
                TimeUnit.HOURS,
                15, // flex интервал (окно выполнения)
                TimeUnit.MINUTES
            )
            .setInitialDelay(initialDelay, TimeUnit.MILLISECONDS)
            .setConstraints(constraints)
            .setInputData(inputData)
            .addTag(WORKER_TAG)
            .build();
            
            // Планируем задачу
            WorkManager.getInstance(reactContext).enqueueUniquePeriodicWork(
                WORKER_TAG,
                ExistingPeriodicWorkPolicy.REPLACE,
                notificationWork
            );
            
            promise.resolve(true);
            
        } catch (Exception e) {
            promise.reject("SCHEDULING_ERROR", e.getMessage());
        }
    }

    @ReactMethod
    public void cancelScheduledNotification(Promise promise) {
        try {
            WorkManager.getInstance(reactContext).cancelAllWorkByTag(WORKER_TAG);
            promise.resolve(null);
        } catch (Exception e) {
            promise.reject("CANCELLATION_ERROR", e.getMessage());
        }
    }
}

// Пакет для модуля
class NotificationPackage implements ReactPackage {
    @Override
    public List<com.facebook.react.bridge.NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        List<com.facebook.react.bridge.NativeModule> modules = new ArrayList<>();
        modules.add(new NotificationModule(reactContext));
        return modules;
    }

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }
}

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost =
      new DefaultReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
          return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
          List<ReactPackage> packages = new PackageList(this).getPackages();
          packages.add(new NotificationPackage());
          return packages;
        }

        @Override
        protected String getJSMainModuleName() {
          return "index";
        }

        @Override
        protected boolean isNewArchEnabled() {
          return BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;
        }

        @Override
        protected Boolean isHermesEnabled() {
          return BuildConfig.IS_HERMES_ENABLED;
        }
      };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, false);
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      DefaultNewArchitectureEntryPoint.load();
    }
  }
}