declare module '*.svg' {
  import {SvgProps} from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}
declare module 'react-native-push-notification' {
  const PushNotification: any;
  export const Importance: any;
  export default PushNotification;
}
