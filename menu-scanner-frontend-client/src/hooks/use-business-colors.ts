import { useAppSelector } from "@/store";
import { selectBusinessColors } from "@/features/business/store/selectors/business-settings-selector";


export function useBusinessColors() {
  const colors = useAppSelector(selectBusinessColors);

  return {
    primary: colors.primary,
  };
}
