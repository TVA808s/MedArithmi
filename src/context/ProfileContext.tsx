// context/ProfileContext.tsx
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import DatabaseService, {UserProfile} from '../services/DatabaseService';

interface ProfileContextType {
  profile: UserProfile;
  updateProfile: (
    field: keyof UserProfile,
    value: string | boolean,
  ) => Promise<void>;
  updateProfileBatch: (updates: Partial<UserProfile>) => Promise<void>;
  loadProfile: () => Promise<void>;
  validationErrors: {name: string; age: string};
  completeOnboarding: () => Promise<void>;
  isLoading: boolean; // Добавляем состояние загрузки
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({children}: {children: ReactNode}) {
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    age: '',
    hasCompletedOnboarding: false,
  });
  const [validationErrors, setValidationErrors] = useState({name: '', age: ''});
  const [isLoading, setIsLoading] = useState(true); // Добавляем состояние загрузки
  const [isInitialized, setIsInitialized] = useState(false); // Флаг инициализации

  const validateName = (name: string): string => {
    if (!name.trim()) {
      return 'Имя обязательно для заполнения';
    }
    if (name.trim().length < 2) {
      return 'Имя должно содержать минимум 2 символа';
    }
    if (name.trim().length > 50) {
      return 'Имя не может быть длиннее 50 символов';
    }
    if (!/^[a-zA-Zа-яА-Я\s-]+$/.test(name.trim())) {
      return 'Имя может содержать только буквы, пробелы и дефисы';
    }
    return '';
  };

  const validateAge = (age: string): string => {
    if (!age.trim()) {
      return 'Возраст обязателен для заполнения';
    }
    if (!/^\d+$/.test(age)) {
      return 'Возраст должен содержать только цифры';
    }
    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      return 'Возраст должен быть от 1 до 120 лет';
    }
    return '';
  };

  const loadProfile = useCallback(
    async (force: boolean = false) => {
      // Если уже инициализировано и не форсируем, пропускаем
      if (isInitialized && !force) {
        console.log('Profile already initialized, skipping load');
        return;
      }

      try {
        setIsLoading(true);
        console.log('Loading profile from DatabaseService...');
        const loadedProfile = await DatabaseService.getUserProfile();
        console.log('Profile loaded:', loadedProfile);

        setProfile(loadedProfile);
        setIsInitialized(true);
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [isInitialized],
  );

  const updateProfile = useCallback(
    async (field: keyof UserProfile, value: string | boolean) => {
      try {
        console.log(`Updating profile field ${field} to:`, value);

        // Валидация
        if (field === 'name' && typeof value === 'string') {
          const error = validateName(value);
          setValidationErrors(prev => ({...prev, name: error}));
          if (error) {
            setProfile(prev => ({...prev, [field]: value}));
            return;
          }
        } else if (field === 'age' && typeof value === 'string') {
          const error = validateAge(value);
          setValidationErrors(prev => ({...prev, age: error}));
          if (error) {
            setProfile(prev => ({...prev, [field]: value}));
            return;
          }
        }

        // Обновляем локальное состояние
        setProfile(prev => {
          const newProfile = {...prev, [field]: value};
          // Сохраняем в БД после обновления состояния
          DatabaseService.saveUserProfile(newProfile).catch(console.error);
          return newProfile;
        });
      } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
      }
    },
    [],
  );

  const updateProfileBatch = useCallback(
    async (updates: Partial<UserProfile>) => {
      try {
        console.log('Batch updating profile:', updates);

        // Валидация
        if (updates.name !== undefined) {
          const error = validateName(updates.name);
          if (error) {
            throw new Error(error);
          }
        }

        if (updates.age !== undefined) {
          const error = validateAge(updates.age);
          if (error) {
            throw new Error(error);
          }
        }

        // Обновляем локальное состояние
        setProfile(prev => {
          const newProfile = {...prev, ...updates};
          // Сохраняем в БД после обновления состояния
          DatabaseService.saveUserProfile(newProfile).catch(console.error);
          return newProfile;
        });
      } catch (error) {
        console.error('Error in batch profile update:', error);
        throw error;
      }
    },
    [],
  );

  const completeOnboarding = useCallback(async () => {
    await updateProfile('hasCompletedOnboarding', true);
  }, [updateProfile]);

  // Загружаем профиль только один раз при монтировании
  useEffect(() => {
    loadProfile(true); // force = true при первой загрузке
  }, [loadProfile]); // Пустой массив зависимостей - только при монтировании

  return (
    <ProfileContext.Provider
      value={{
        profile,
        updateProfile,
        updateProfileBatch,
        loadProfile,
        validationErrors,
        completeOnboarding,
        isLoading,
      }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
