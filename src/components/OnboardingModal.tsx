// components/OnboardingModal.tsx
import React, {useState, useEffect} from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Icon from './Icons';

interface OnboardingModalProps {
  visible: boolean;
  onClose: () => void;
  onComplete: (name: string, age: string) => Promise<void>;
  initialName?: string;
  initialAge?: string;
}

type OnboardingStep = 'welcome' | 'name' | 'description' | 'age' | 'complete';

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  visible,
  onClose,
  onComplete,
  initialName = '',
  initialAge = '',
}) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [name, setName] = useState(initialName);
  const [age, setAge] = useState(initialAge);
  const [nameError, setNameError] = useState('');
  const [ageError, setAgeError] = useState('');

  // Сбрасываем состояние при открытии модалки
  useEffect(() => {
    if (visible) {
      setCurrentStep('welcome');
      setName(initialName);
      setAge(initialAge);
      setNameError('');
      setAgeError('');
    }
  }, [visible, initialName, initialAge]);

  const validateName = (value: string): boolean => {
    if (!value.trim()) {
      setNameError('Имя обязательно для заполнения');
      return false;
    }
    if (value.trim().length < 2) {
      setNameError('Имя должно содержать минимум 2 символа');
      return false;
    }
    if (!/^[a-zA-Zа-яА-Я\s-]+$/.test(value.trim())) {
      setNameError('Имя может содержать только буквы, пробелы и дефисы');
      return false;
    }
    setNameError('');
    return true;
  };

  const validateAge = (value: string): boolean => {
    if (!value.trim()) {
      setAgeError('Возраст обязателен для заполнения');
      return false;
    }
    if (!/^\d+$/.test(value)) {
      setAgeError('Возраст должен содержать только цифры');
      return false;
    }
    const ageNum = parseInt(value, 10);
    if (ageNum < 1 || ageNum > 120) {
      setAgeError('Возраст должен быть от 1 до 120 лет');
      return false;
    }
    setAgeError('');
    return true;
  };

  const handleNext = () => {
    switch (currentStep) {
      case 'welcome':
        setCurrentStep('name');
        break;
      case 'name':
        if (validateName(name)) {
          setCurrentStep('description');
        }
        break;
      case 'description':
        setCurrentStep('age');
        break;
      case 'age':
        if (validateAge(age)) {
          setCurrentStep('complete');
        }
        break;
      case 'complete':
        handleComplete();
        break;
    }
  };

  const handleComplete = async () => {
    console.log('Completing onboarding with:', {name, age});
    await onComplete(name, age);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <View style={styles.stepContent}>
            <Icon name="heart" size={80} color="#E75F55" />
            <Text style={styles.welcomeTitle}>
              Добро пожаловать в PulseSport!
            </Text>
            <Text style={styles.welcomeText}>
              Ваш персональный помощник для отслеживания пульсовых зон
            </Text>
          </View>
        );

      case 'name':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Как вас зовут?</Text>
            <TextInput
              style={[styles.input, nameError ? styles.inputError : null]}
              value={name}
              onChangeText={text => {
                console.log('Name input changed:', `"${text}"`); // Добавить лог
                setName(text);
                if (nameError) {
                  validateName(text);
                }
              }}
              placeholder="Введите ваше имя"
              placeholderTextColor="#C0C0C0"
              autoFocus
            />
            {nameError ? (
              <Text style={styles.errorText}>{nameError}</Text>
            ) : null}
          </View>
        );

      case 'description':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>
              {name || 'Пользователь'}, наше приложение позволяет:
            </Text>
            <View style={styles.bulletPoints}>
              <Text style={styles.bulletPoint}>
                • Рассчитывать индивидуальные пульсовые зоны
              </Text>
              <Text style={styles.bulletPoint}>
                • Отслеживать эффективность тренировок
              </Text>
              <Text style={styles.bulletPoint}>
                • Получать рекомендации по нагрузкам
              </Text>
              <Text style={styles.bulletPoint}>
                • Вести историю своих результатов
              </Text>
            </View>
          </View>
        );

      case 'age':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>
              Для корректных вычислений укажите ваш возраст
            </Text>
            <TextInput
              style={[styles.input, ageError ? styles.inputError : null]}
              value={age}
              onChangeText={text => {
                const numericValue = text.replace(/[^0-9]/g, '');
                setAge(numericValue);
                if (ageError) {
                  validateAge(numericValue);
                }
              }}
              placeholder="Введите ваш возраст"
              placeholderTextColor="#C0C0C0"
              keyboardType="numeric"
              maxLength={3}
              autoFocus
            />
            {ageError ? <Text style={styles.errorText}>{ageError}</Text> : null}
          </View>
        );

      case 'complete':
        return (
          <View style={styles.stepContent}>
            <Icon name="heart" size={80} color="#4CAF50" />
            <Text style={styles.completeTitle}>Всё настроено!</Text>
            <Text style={styles.completeText}>
              Приятного использования PulseSport, {name}!
            </Text>
          </View>
        );
    }
  };

  const getButtonText = () => {
    switch (currentStep) {
      case 'welcome':
        return 'Начать';
      case 'complete':
        return 'В приложение';
      default:
        return 'Далее';
    }
  };

  const isNextDisabled = () => {
    if (currentStep === 'name' && nameError) {
      return true;
    }
    if (currentStep === 'age' && ageError) {
      return true;
    }
    return false;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <View style={styles.closeIcon}>
                <View
                  style={[styles.closeLine, {transform: [{rotate: '45deg'}]}]}
                />
                <View
                  style={[styles.closeLine, {transform: [{rotate: '-45deg'}]}]}
                />
              </View>
            </TouchableOpacity>

            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}>
              {renderStep()}
            </ScrollView>

            <TouchableOpacity
              style={[
                styles.nextButton,
                isNextDisabled() ? styles.nextButtonDisabled : null,
              ]}
              onPress={handleNext}
              disabled={isNextDisabled()}>
              <Text style={styles.nextButtonText}>{getButtonText()}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
    padding: 8,
  },
  closeIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  stepContent: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#E75F55',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 22,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000',
    height: 48,
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  errorText: {
    fontSize: 12,
    color: '#FF6B6B',
    marginTop: 8,
    textAlign: 'center',
  },
  bulletPoints: {
    width: '100%',
    marginTop: 16,
  },
  closeLine: {
    position: 'absolute',
    width: 20,
    height: 2,
    backgroundColor: '#718096',
    borderRadius: 1,
  },
  bulletPoint: {
    fontSize: 16,
    color: '#718096',
    marginBottom: 12,
    lineHeight: 22,
  },
  completeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  completeText: {
    fontSize: 18,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 24,
  },
  nextButton: {
    backgroundColor: '#E75F55',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  nextButtonDisabled: {
    backgroundColor: '#FFB5B0',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default OnboardingModal;
