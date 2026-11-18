import { useLocalSearchParams } from 'expo-router';
import { PersonEditScreen } from '@/components/people/PersonFormScreen';

export default function StudentEditRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PersonEditScreen resource="students" id={id} />;
}
