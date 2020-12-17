import React, { useEffect } from "react";
import { useDispatch, shallowEqual, useSelector } from "react-redux";
import { ToastProvider } from "react-toast-notifications";
import { Home } from "./Home";
import { LoadingScreen } from "../components/common/FullPageLoading";
import {
  getAcademicYearFromState,
  getUserIdFromState,
  getUserPlansFromState,
} from "../state";
import { AppState } from "../state/reducers/state";
import { setUserPlansAction } from "../state/actions/userPlansActions";
import { getAuthToken } from "../utils/auth-helpers";
import { findAllPlansForUser } from "../services/PlanService";
import { IPlanData } from "../models/types";

export const HomeWrapper: React.FC = () => {
  const dispatch = useDispatch();
  const token = getAuthToken();

  const { userId, academicYear, userPlans } = useSelector(
    (state: AppState) => ({
      userId: getUserIdFromState(state),
      academicYear: getAcademicYearFromState(state)!,
      userPlans: getUserPlansFromState(state),
    }),
    shallowEqual
  );

  useEffect(() => {
    findAllPlansForUser(userId, token).then((plans: IPlanData[]) => {
      dispatch(setUserPlansAction(plans, academicYear));
    });
  }, []);

  if (userPlans.length === 0) {
    return (
      <LoadingScreen
        text="Getting GraduateNU ready"
        subText="Don't worry, it'll take just a second"
      />
    );
  } else {
    return (
      <ToastProvider placement="bottom-right" autoDismissTimeout={10000}>
        <Home />
      </ToastProvider>
    );
  }
};
