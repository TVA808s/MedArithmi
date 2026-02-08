// src/components/withAnalytics.tsx
import React, {useEffect} from 'react';
import FirebaseService from '../services/FirebaseService';

/**
 * HOC для автоматического логирования просмотров экранов
 */
export const withAnalytics = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  screenName: string
) => {
  const ComponentWithAnalytics: React.FC<P> = (props) => {
    useEffect(() => {
      // Логируем просмотр экрана
      const logScreenView = async () => {
        try {
          await FirebaseService.logScreenView(screenName);
        } catch (error) {
          console.error(`Error logging screen ${screenName}:`, error);
        }
      };
      
      logScreenView();
    }, []);

    return <WrappedComponent {...props} />;
  };

  return ComponentWithAnalytics;
};