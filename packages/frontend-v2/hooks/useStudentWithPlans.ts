import useSWR, { KeyedMutator, SWRResponse } from "swr";
import { API } from "@graduate/api-client";
import { GetStudentResponse, StudentModel } from "@graduate/common";
import { AxiosError } from "axios";
import { preparePlanForDnd } from "../utils";

type StudentResponse = Omit<
  SWRResponse<GetStudentResponse, AxiosError>,
  "data" | "mutate"
>;

type UseStudentReturn = StudentResponse & {
  isLoading: boolean;
  mutateStudent: KeyedMutator<StudentModel<string>>;
  student?: StudentModel<string>;
};

/**
 * Returns the student with plan using SWR. Will later be removed when we switch
 * to cookies.
 */
export function useStudentWithPlans(): UseStudentReturn {
  const key = `api/students/me`;

  const { data, mutate, ...rest } = useSWR(key, fetchStudentAndPrepareForDnd);

  return {
    ...rest,
    student: data,
    mutateStudent: mutate,
    isLoading: !data && !rest.error,
  };
}

/**
 * Fetches the student with plans and prepares all of the student's plans for
 * drag and drop by adding drag and drop ids.
 */
export const fetchStudentAndPrepareForDnd = async (): Promise<
  StudentModel<string>
> => {
  const student = await API.student.getMeWithPlan();
  const plansWithDndIds = student.plans.map(preparePlanForDnd);
  return {
    ...student,
    plans: plansWithDndIds,
  };
};
