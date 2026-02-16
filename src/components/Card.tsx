// components/Card.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Switch,
  TextInput,
} from 'react-native';
import Icon, {IconName} from './Icons';

export type CardType =
  | 'main'
  | 'calculator'
  | 'result'
  | 'hint'
  | 'history'
  | 'setting'
  | 'settingInfo'
  | 'stats'
  | 'profile';

export type ZoneName =
  | 'Восстановление'
  | 'Аэробная'
  | 'Темповая'
  | 'Анаэробная'
  | 'Максимальная';

export const ZONE_COLORS: Record<ZoneName, string> = {
  Восстановление: '#339e1a',
  Аэробная: '#9e1a72',
  Темповая: '#1a9e97',
  Анаэробная: '#9e691a',
  Максимальная: '#9e1a1a',
};

export const ZONE_BACKGROUNDS: Record<ZoneName, string> = {
  Восстановление: '#ebffe7',
  Аэробная: '#ffe7f1',
  Темповая: '#e7faff',
  Анаэробная: '#fff5e7',
  Максимальная: '#ffe7e7',
};

export const ZONE_ICONS: Record<ZoneName, IconName> = {
  Восстановление: 'plant',
  Аэробная: 'heart',
  Темповая: 'droplet',
  Анаэробная: 'star',
  Максимальная: 'lightning',
};

export interface CardProps {
  type: CardType;
  children?: React.ReactNode;
  zoneName?: ZoneName;
  title?: string;
  description?: string;
  iconName?: IconName;
  iconSize?: number;
  iconColor?: string;
  iconCircleColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  value?: string;
  unit?: string;
  switchValue?: boolean;
  onSwitchToggle?: () => void;
  switchDisabled?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  rightContent?: React.ReactNode;
  headerRight?: React.ReactNode;
  time?: string;
  zoneMin?: number;
  zoneMax?: number;
  restingHR?: number;
  age?: number;
  stats?: {
    min?: number;
    avg?: number;
    max?: number;
    minLabel?: string;
    avgLabel?: string;
    maxLabel?: string;
  };
  style?: ViewStyle;
  titleStyle?: TextStyle;
  descriptionStyle?: TextStyle;
  valueStyle?: TextStyle;
  profileData?: {
    name: string;
    age: string;
  };
  onProfileChange?: (field: 'name' | 'age', value: string) => void;
  validationErrors?: {
    name: string;
    age: string;
  };
  nameBorderColor?: string;
  ageBorderColor?: string;
}

export const Card: React.FC<CardProps> = ({
  type,
  children,
  zoneName,
  title,
  description,
  iconName,
  iconSize = 24,
  iconColor,
  iconCircleColor,
  backgroundColor,
  borderColor,
  textColor,
  value,
  unit,
  switchValue,
  onSwitchToggle,
  switchDisabled,
  onPress,
  disabled,
  rightContent,
  headerRight,
  time,
  zoneMin,
  zoneMax,
  restingHR,
  age,
  stats,
  style,
  titleStyle,
  descriptionStyle,
  valueStyle,
  profileData,
  onProfileChange,
  validationErrors,
  nameBorderColor,
  ageBorderColor,
}) => {
  const getZoneColors = () => {
    if (zoneName && ZONE_COLORS[zoneName]) {
      return {
        textColor: textColor || ZONE_COLORS[zoneName],
        backgroundColor: backgroundColor || ZONE_BACKGROUNDS[zoneName],
        borderColor: borderColor || ZONE_COLORS[zoneName],
        iconName: iconName || ZONE_ICONS[zoneName],
      };
    }
    return {
      textColor,
      backgroundColor,
      borderColor,
      iconName,
    };
  };

  const zoneColors = getZoneColors();
  const finalTextColor = zoneColors.textColor;
  const finalBackgroundColor = zoneColors.backgroundColor;
  const finalBorderColor = zoneColors.borderColor;
  const finalIconName = zoneColors.iconName || iconName;

  const renderMainCard = () => (
    <View style={styles.mainContentContainer}>
      <View style={styles.mainTextContainer}>
        <View style={styles.mainHeader}>
          <Text style={[styles.mainTitle, titleStyle, {color: finalTextColor}]}>
            {zoneName || title}
          </Text>
        </View>
        <View style={styles.mainDescriptionContainer}>
          <Text style={[styles.mainDescriptionText, descriptionStyle]}>
            {description}
          </Text>
        </View>
      </View>
      <View style={styles.mainRightSection}>
        {finalIconName && (
          <View style={styles.mainIconContainer}>
            <Icon
              name={finalIconName}
              size={iconSize}
              color={finalTextColor}
              style={styles.mainIcon}
            />
          </View>
        )}
        <View style={styles.mainArrowContainer}>
          {rightContent || (
            <Text style={[styles.mainArrowText, {color: finalTextColor}]}>
              {'>>>'}
            </Text>
          )}
        </View>
      </View>
    </View>
  );

  const renderHintCard = () => (
    <>
      <View style={styles.cardHeader}>
        <View style={[styles.iconCircle, styles.hintIconCircle]}>
          <Icon
            name={iconName || 'info'}
            size={iconSize || 22}
            color={iconColor || '#005db9'}
          />
        </View>
        <Text style={[styles.hintCardTitle, titleStyle]}>{title}</Text>
      </View>
      <Text style={[styles.hintCardDescription, descriptionStyle]}>
        {description}
      </Text>
    </>
  );

  const renderCalculatorCard = () => (
    <>
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.iconCircle,
            styles.calculatorIconCircle,
            iconCircleColor && {backgroundColor: iconCircleColor},
          ]}>
          <Icon
            name={iconName || 'calculator'}
            size={iconSize || 24}
            color={iconColor || '#FFA000'}
          />
        </View>
        <Text style={[styles.calculatorCardTitle, titleStyle]}>
          {title || 'Введите данные'}
        </Text>
      </View>
      {children}
    </>
  );

  const renderResultCard = () => (
    <View
      style={[
        styles.resultContent,
        finalBackgroundColor && {backgroundColor: finalBackgroundColor},
      ]}>
      <View
        style={[styles.resultIconCircle, {backgroundColor: finalTextColor}]}>
        <Icon name={finalIconName || 'heart'} size={32} color="#FFFFFF" />
      </View>
      <Text
        style={[styles.resultZoneName, {color: finalTextColor}, titleStyle]}>
        {zoneName || title}
      </Text>
      <Text style={[styles.resultValue, {color: finalTextColor}, valueStyle]}>
        {value} {unit && <Text style={styles.resultUnit}>{unit}</Text>}
      </Text>
      <View
        style={[
          styles.resultDivider,
          {backgroundColor: (finalTextColor || '#A21812') + '40'},
        ]}
      />
      <Text style={[styles.resultDescription, {color: finalTextColor}]}>
        {description}
      </Text>
    </View>
  );

  const renderHistoryCard = () => (
    <>
      <View style={styles.historyCardHeader}>
        <View style={styles.historyTitleContainer}>
          <View style={styles.historyTitleLeft}>
            <View
              style={[
                styles.historyIconCircle,
                {backgroundColor: (finalTextColor || '#A21812') + '20'},
              ]}>
              <Icon
                name={finalIconName || 'heart'}
                size={24}
                color={finalTextColor}
              />
            </View>
            <View style={styles.historyTitleTextContainer}>
              <Text style={[styles.historyCardTitle, {color: finalTextColor}]}>
                {zoneName || title}
              </Text>
              {time && <Text style={styles.historyCardTime}>{time}</Text>}
            </View>
          </View>
          {headerRight}
        </View>
      </View>

      <View style={styles.historyCalculationsBlock}>
        <View style={styles.historyCalculationRow}>
          <View style={styles.historyCalculationLabelContainer}>
            <Icon name="pulse" size={18} color="#718096" />
            <Text style={styles.historyCalculationLabel}>Результат:</Text>
          </View>
          <Text
            style={[styles.historyCalculationValue, {color: finalTextColor}]}>
            {zoneMin} - {zoneMax} уд/мин
          </Text>
        </View>

        <View style={styles.historyCalculationDivider} />

        <View style={styles.historyCalculationRow}>
          <View style={styles.historyCalculationLabelContainer}>
            <Icon name="heart2" size={18} color="#718096" />
            <Text style={styles.historyCalculationLabel}>ЧСС покоя:</Text>
          </View>
          <Text style={styles.historyCalculationValueGray}>
            {restingHR} уд/мин
          </Text>
        </View>

        <View style={styles.historyCalculationDivider} />

        <View style={styles.historyCalculationRow}>
          <View style={styles.historyCalculationLabelContainer}>
            <Icon name="person" size={18} color="#718096" />
            <Text style={styles.historyCalculationLabel}>Возраст:</Text>
          </View>
          <Text style={styles.historyCalculationValueGray}>{age} лет</Text>
        </View>
      </View>
    </>
  );

  const renderSettingCard = () => (
    <>
      <View style={styles.settingCardHeader}>
        <View
          style={[
            styles.iconCircle,
            styles.settingIconCircle,
            iconCircleColor && {backgroundColor: iconCircleColor},
          ]}>
          <Icon
            name={iconName || 'notification'}
            size={iconSize || 24}
            color={iconColor || '#FFA000'}
          />
        </View>
        <View style={styles.settingTitleContainer}>
          <Text style={[styles.settingCardTitle, titleStyle]}>{title}</Text>
          {onSwitchToggle && (
            <Switch
              trackColor={{false: '#E0E0E0', true: iconColor || '#FFA000'}}
              thumbColor={'#FFFFFF'}
              ios_backgroundColor="#E0E0E0"
              onValueChange={onSwitchToggle}
              value={switchValue}
              disabled={switchDisabled}
            />
          )}
        </View>
      </View>
      <Text style={[styles.settingCardDescription, descriptionStyle]}>
        {description}
      </Text>
    </>
  );

  const renderSettingInfoCard = () => (
    <>
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.iconCircle,
            styles.settingInfoIconCircle,
            iconCircleColor && {backgroundColor: iconCircleColor},
          ]}>
          <Icon
            name={iconName || 'info'}
            size={iconSize || 24}
            color={iconColor || '#4CAF50'}
          />
        </View>
        <Text style={[styles.settingInfoCardTitle, titleStyle]}>{title}</Text>
      </View>
      <Text style={[styles.settingInfoCardDescription, descriptionStyle]}>
        {description}
      </Text>
    </>
  );

  const renderStatsCard = () => (
    <>
      <Text style={styles.statsInfoText}>{description}</Text>
      <View style={styles.statsDivider} />
      {stats && (
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <View style={[styles.statsIconCircle, styles.statsMinIconCircle]}>
              <Icon name="heart" size={28} color="#55e781" />
            </View>
            <Text style={styles.statValue}>{stats.min}</Text>
            <Text style={styles.statLabel}>
              {stats.minLabel || 'Мин. пульс'}
            </Text>
          </View>

          <View style={styles.statItem}>
            <View style={[styles.statsIconCircle, styles.statsAvgIconCircle]}>
              <Icon name="heart" size={28} color="#dde755" />
            </View>
            <Text style={styles.statValue}>{stats.avg}</Text>
            <Text style={styles.statLabel}>
              {stats.avgLabel || 'Средний пульс'}
            </Text>
          </View>

          <View style={styles.statItem}>
            <View style={[styles.statsIconCircle, styles.statsMaxIconCircle]}>
              <Icon name="heart" size={28} color="#E75F55" />
            </View>
            <Text style={styles.statValue}>{stats.max}</Text>
            <Text style={styles.statLabel}>
              {stats.maxLabel || 'Макс. пульс'}
            </Text>
          </View>
        </View>
      )}
    </>
  );
  const renderProfileCard = () => {
    const profile = profileData || {name: '', age: ''};
    const handleChange = onProfileChange;
    const errors = validationErrors || {name: '', age: ''};

    return (
      <>
        <View style={styles.cardHeader}>
          <View style={[styles.iconCircle, styles.profileIconCircle]}>
            <Icon name="person" size={24} color="#2196F3" />
          </View>
          <View style={styles.profileHeaderText}>
            <Text style={styles.profileCardTitle}>Профиль</Text>
            <Text style={styles.profileCardDescription}>
              Ваши персональные данные
            </Text>
          </View>
        </View>

        <View style={styles.profileContent}>
          <View style={styles.inputFieldContainer}>
            <Text style={styles.inputFieldLabel}>Имя</Text>
            <View style={styles.inputFieldRow}>
              <TextInput
                style={[
                  styles.inputField,
                  {borderColor: nameBorderColor || '#E0E0E0'},
                ]}
                value={profile.name}
                onChangeText={newValue => {
                  // Переименовано с value на newValue
                  handleChange?.('name', newValue);
                }}
                placeholder="Введите ваше имя"
                placeholderTextColor="#C0C0C0"
                keyboardType="default"
                returnKeyType="done"
                autoCapitalize="words"
                autoCorrect={false}
                spellCheck={false}
                textContentType="name"
                autoComplete="name"
                allowFontScaling={true}
              />
            </View>
            {errors.name ? (
              <Text style={styles.errorText}>{errors.name}</Text>
            ) : null}
          </View>

          <View style={styles.inputDivider} />

          <View style={styles.inputFieldContainer}>
            <Text style={styles.inputFieldLabel}>Возраст</Text>
            <View style={styles.inputFieldRow}>
              <TextInput
                style={[
                  styles.inputField,
                  {borderColor: ageBorderColor || '#E0E0E0'},
                ]}
                value={profile.age}
                onChangeText={text => {
                  const numericValue = text.replace(/[^0-9]/g, '');
                  handleChange?.('age', numericValue);
                }}
                placeholder="Введите ваш возраст"
                placeholderTextColor="#C0C0C0"
                keyboardType="numeric"
                maxLength={3}
                returnKeyType="done"
              />
            </View>
            {errors.age ? (
              <Text style={styles.errorText}>{errors.age}</Text>
            ) : null}
          </View>
        </View>
      </>
    );
  };
  const renderContent = () => {
    if (children && type !== 'calculator' && type !== 'main') {
      return children;
    }

    switch (type) {
      case 'main':
        return renderMainCard();
      case 'hint':
        return renderHintCard();
      case 'calculator':
        return renderCalculatorCard();
      case 'result':
        return renderResultCard();
      case 'history':
        return renderHistoryCard();
      case 'setting':
        return renderSettingCard();
      case 'settingInfo':
        return renderSettingInfoCard();
      case 'stats':
        return renderStatsCard();
      case 'profile':
        return renderProfileCard();
      default:
        return null;
    }
  };

  const getCardStyle = () => {
    const baseStyle = {
      marginBottom: 16,
    };

    switch (type) {
      case 'main':
        return {
          ...baseStyle,
          width: '84%',
          minHeight: 120,
          borderRadius: 24,
          padding: 20,
          borderWidth: 2,
          backgroundColor: finalBackgroundColor || '#FFFFFF',
          borderColor: finalBorderColor || '#A0C28E',
        };
      case 'hint':
        return {
          ...baseStyle,
          ...styles.hintCard,
        };
      case 'calculator':
        return {
          ...baseStyle,
          ...styles.calculatorCard,
        };
      case 'result':
        return {
          ...baseStyle,
          width: '100%',
          borderRadius: 24,
          borderWidth: 2,
          overflow: 'hidden',
          backgroundColor: finalBackgroundColor,
          borderColor: finalBorderColor,
        };
      case 'history':
        return {
          ...baseStyle,
          borderRadius: 8,
          padding: 12,
          borderTopWidth: 4,
          borderWidth: 1,
          elevation: 3,
          backgroundColor: finalBackgroundColor,
          borderTopColor: finalTextColor,
          borderColor: '#E0E0E0',
        };
      case 'setting':
      case 'settingInfo':
        return {
          ...baseStyle,
          backgroundColor: backgroundColor || '#FFFFFF',
          borderRadius: 24,
          padding: 16,
          width: '100%',
          elevation: 3,
        };
      case 'stats':
        return {
          ...baseStyle,
          ...styles.statsCard,
        };
      case 'profile':
        return {
          ...baseStyle,
          backgroundColor: '#FFFFFF',
          borderRadius: 24,
          padding: 16,
          width: '100%',
          elevation: 3,
        };
      default:
        return baseStyle;
    }
  };

  const CardWrapper = onPress ? TouchableOpacity : View;

  return (
    <CardWrapper
      style={[getCardStyle(), style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={onPress ? 0.7 : 1}>
      {renderContent()}
    </CardWrapper>
  );
};

const styles = StyleSheet.create({
  // Общие стили
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  profileIconCircle: {
    backgroundColor: '#E3F2FD',
  },

  // Стили для main карточки
  mainContentContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
  },
  mainTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  mainHeader: {
    marginBottom: 8,
  },
  mainTitle: {
    fontFamily: 'sans-serif-medium',
    fontSize: 18,
    fontWeight: '400',
  },
  mainDescriptionContainer: {
    flex: 1,
  },
  mainDescriptionText: {
    fontWeight: '400',
    fontSize: 14,
    color: '#7a7a7a',
    lineHeight: 18,
  },
  mainRightSection: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  mainIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainIcon: {
    opacity: 0.3,
  },
  mainArrowContainer: {
    marginTop: 'auto',
  },
  mainArrowText: {
    fontFamily: 'sans-serif-medium',
    fontSize: 21,
    fontWeight: '600',
    opacity: 0.5,
  },

  // Стили для hint карточки
  hintCard: {
    backgroundColor: '#e8f5ff',
    borderRadius: 24,
    padding: 16,
    width: '100%',
    elevation: 3,
  },
  hintIconCircle: {
    backgroundColor: '#ffffff',
  },
  hintCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#005db9',
  },
  hintCardDescription: {
    fontSize: 14,
    color: '#3c9dff',
    lineHeight: 16,
    marginLeft: 52,
  },

  // Стили для calculator карточки
  calculatorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    width: '100%',
    elevation: 3,
  },
  calculatorIconCircle: {
    backgroundColor: '#FFF3E0',
  },
  calculatorCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },

  // Стили для result карточки
  resultContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  resultIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultZoneName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  resultValue: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  resultUnit: {
    fontSize: 16,
  },
  resultDivider: {
    height: 1,
    width: '80%',
    marginBottom: 8,
  },
  resultDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Стили для history карточки
  historyCardHeader: {
    marginBottom: 8,
  },
  historyTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  historyIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyTitleTextContainer: {
    flex: 1,
  },
  historyCardTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  historyCardTime: {
    fontSize: 12,
    color: '#718096',
  },
  historyCalculationsBlock: {
    backgroundColor: '#ffffffa4',
    borderRadius: 4,
    paddingHorizontal: 10,
    marginTop: 8,
  },
  historyCalculationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  historyCalculationLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  historyCalculationLabel: {
    fontSize: 16,
    color: '#718096',
  },
  historyCalculationValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  historyCalculationValueGray: {
    fontSize: 16,
    color: '#718096',
    fontWeight: '500',
  },
  historyCalculationDivider: {
    height: 1,
    backgroundColor: '#71809638',
  },

  // Стили для setting карточки
  settingCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingIconCircle: {
    backgroundColor: '#FFF3E0',
  },
  settingTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  settingCardDescription: {
    fontSize: 14,
    color: '#718096',
    lineHeight: 18,
    marginLeft: 52,
  },

  // Стили для settingInfo карточки
  settingInfoIconCircle: {
    backgroundColor: '#FFFFFF',
  },
  settingInfoCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  settingInfoCardDescription: {
    fontSize: 14,
    color: '#718096',
    lineHeight: 18,
    marginLeft: 52,
  },

  // Стили для stats карточки
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 12,
    width: '100%',
    elevation: 5,
  },
  statsInfoText: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 12,
  },
  statsDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statsIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsMinIconCircle: {
    backgroundColor: '#55e7813b',
  },
  statsAvgIconCircle: {
    backgroundColor: '#dde75538',
  },
  statsMaxIconCircle: {
    backgroundColor: '#e75f552d',
  },
  statValue: {
    fontSize: 24,
    color: '#000',
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
    color: '#718096',
  },
  profileHeaderText: {
    flex: 1,
  },
  profileCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  profileCardDescription: {
    fontSize: 14, // Изменил на 14, так как 16 было слишком крупно для описания
    color: '#718096',
    lineHeight: 18,
  },
  profileContent: {
    marginTop: 8,
    width: '100%',
  },
  inputFieldContainer: {
    marginBottom: 8,
    width: '100%',
  },
  inputFieldLabel: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 8,
  },
  inputFieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  inputField: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
    color: '#718096',
    fontWeight: '600',
    fontSize: 16,
    height: 48,
  },
  inputDivider: {
    height: 1,
    backgroundColor: '#71809638',
    marginVertical: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#FF6B6B',
  },
});

export default Card;
