import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
    Welcome: undefined;
    Onboarding: undefined;
    Main: undefined;
    Camera: undefined;
    ManualEntry: undefined;
    MealDetail: {
        photoUri?: string;
        prediction?: {
            name: string;
            calories: number;
            protein: number;
            carbs: number;
            fat: number;
            comment?: string;
        };
    };
    Profile: undefined;
};

export type OnboardingScreenProps = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;
export type CameraScreenProps = NativeStackScreenProps<RootStackParamList, 'Camera'>;
export type MealDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'MealDetail'>;

// For useNavigation hook typing
declare global {
    namespace ReactNavigation {
        interface RootParamList extends RootStackParamList { }
    }
}
