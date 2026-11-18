import { useLocalSearchParams } from 'expo-router';
import { PersonEditScreen } from '@/components/people/PersonFormScreen';

export default function TeacherEditRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PersonEditScreen resource="teachers" id={id} />;
}
