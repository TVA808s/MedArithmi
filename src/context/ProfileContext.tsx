// context/ProfileContext.tsx
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from 'react';
import DatabaseService, {UserProfile} from '../services/DatabaseService';

interface ProfileContextType {
  profile: UserProfile;
  updateProfile: (field: keyof UserProfile, value: string) => Promise<void>;
  loadProfile: () => Promise<void>;
  validationErrors: {name: string; age: string};
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({children}: {children: ReactNode}) {
  const [profile, setProfile] = useState<UserProfile>({name: '', age: ''});
  const [validationErrors, setValidationErrors] = useState({name: '', age: ''});

  const validateName = (name: string): string => {
    if (!name.trim()) {
      return ''; // Пустое имя разрешено (необязательное поле)
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
      return ''; // Пустой возраст разрешен (необязательное поле)
    }

    // Проверяем, что строка состоит только из цифр
    if (!/^\d+$/.test(age)) {
      return 'Возраст должен содержать только цифры';
    }

    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum)) {
      return 'Возраст должен быть числом';
    }
    if (ageNum < 1) {
      return 'Возраст должен быть больше 0';
    }
    if (ageNum > 120) {
      return 'Возраст не может быть больше 120 лет';
    }
    return '';
  };

  const updateProfile = async (field: keyof UserProfile, value: string) => {
    try {
      console.log(`Updating profile field ${field} to:`, value);

      // Валидация перед обновлением
      let error = '';
      if (field === 'name') {
        error = validateName(value);
      } else if (field === 'age') {
        error = validateAge(value);
      }

      // Обновляем ошибки валидации
      setValidationErrors(prev => ({...prev, [field]: error}));

      // Если есть ошибка, не сохраняем в БД
      if (error) {
        console.log('Validation error:', error);
        // Все равно обновляем UI, но не сохраняем
        setProfile(prev => ({...prev, [field]: value}));
        return;
      }

      // Обновляем профиль
      const newProfile = {...profile, [field]: value};
      setProfile(newProfile);

      // Сохраняем в БД только если нет ошибок
      await DatabaseService.saveUserProfile(newProfile);
      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const loadProfile = async () => {
    try {
      console.log('Loading profile from DatabaseService...');
      const loadedProfile = await DatabaseService.getUserProfile();
      console.log('Profile loaded in context:', loadedProfile);
      setProfile(loadedProfile);
      // Сбрасываем ошибки при загрузке
      setValidationErrors({name: '', age: ''});
    } catch (error) {
      console.error('Error loading profile in context:', error);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  return (
    <ProfileContext.Provider
      value={{profile, updateProfile, loadProfile, validationErrors}}>
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
