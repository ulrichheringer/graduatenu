import React, { useState, useEffect } from "react";
import { Link, withRouter } from "react-router-dom";
import styled from "styled-components";
import { fetchUser, getStudents } from "../services/AdvisorService";
import { Search } from "../components/common/Search";
import { LinearProgress, IconButton, Avatar, Tooltip } from "@material-ui/core";
import { getAuthToken } from "../utils/auth-helpers";
import {
  EditableSchedule,
  NonEditableSchedule,
  NonEditableScheduleStudentView,
} from "../components/Schedule/ScheduleComponents";
import { findAllPlansForUser } from "../services/PlanService";
import { IPlanData, IUserData } from "../models/types";
import {
  expandAllYearsForActivePlanAction,
  setUserPlansAction,
} from "../state/actions/userPlansActions";
import { useDispatch, useSelector } from "react-redux";
import {
  getActivePlanCoopCycleFromState,
  getActivePlanMajorFromState,
  getActivePlanNameFromState,
  getUserFullNameFromState,
} from "../state";
import { AppState } from "../state/reducers/state";
import {
  ArrowBack,
  Check,
  Edit,
  Fullscreen,
  FullscreenExit,
} from "@material-ui/icons";
import { resetUserAction, setUserAction } from "../state/actions/userActions";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { SwitchPlanList } from "../components/SwitchPlan/SwitchPlanList";
import { ColoredButton } from "../components/common/ColoredButton";
import { getInitialsFromName } from "../utils/student-helpers";
import { AutoSavePlan } from "../home/AutoSavePlan";

const Container = styled.div`
  margin-left: 30px;
  margin-right: 30px;
  margin-top: 50px;
  font-family: Roboto;
  font-style: normal;
  font-weight: normal;
`;

const StudentListScrollContainer = styled.div`
  width: auto;
  height: 360px;
  padding: 20px;
  overflow-y: scroll;
  height: 50vh;
`;

const StudentListContainer = styled.div`
  margin-top: 30px;
  border: 1px solid red;
  border-radius: 10px;
  width: auto;
  padding: 20px;
`;

const StudentContainer = styled.div`
  font-size: 18px;
  line-height: 21px;
  padding: 10px;
  margin-top: 5px;
  &:hover {
    background-color: #efefef;
    border-radius: 20px;
    cursor: pointer;
  }
`;

const StudentEmailNUIDContainer = styled.div`
  font-size: 10px;
  color: gray;
`;

const Loading = styled.div`
  font-size: 15px;
  line-height: 21px;
  margin-top: 20px;
  margin-bottom: 5px;
  margin-left: 30px;
  margin-right: 30px;
`;

const EmptyState = styled.div`
  font-size: 18px;
  line-height: 21px;
  padding: 10px;
`;

const LoadMoreStudents = styled.div`
  font-size: 10px;
  line-height: 21px;
  margin: 10px;
  color: red;
  &:hover {
    text-decoration: underline;
  }
  cursor: pointer;
`;

const NoMoreStudents = styled.div`
  font-size: 10px;
  line-height: 21px;
  margin: 10px;
  color: red;
`;

const StudentViewContainer = styled.div`
  margin-top: 30px;
  display: flex;
  justify-content: center;
  > * {
    border: 1px solid red;
    border-radius: 10px;
    height: 70vh;
    padding: 30px;
  }
  * {
    font-family: Roboto;
    font-style: normal;
  }
`;

const FullScheduleViewContainer = styled.div`
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  * {
    font-family: Roboto;
    font-style: normal;
  }
`;

const ExpandedScheduleStudentInfo = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const ScheduleWrapper = styled.div`
  overflow-x: scroll;
  height: 95%;
`;

const SchedulePreviewContainer = styled.div`
  overflow: hidden;
  flex: 5;
`;
const PlanTitle = styled.div`
  display: flex;
  justify-content: center;
  height: 24px;
  font-family: Roboto;
  font-weight: bold;
  font-size: 24px;
`;
const ButtonHeader = styled.div`
  display: flex;
  justify-content: flex-end;
  height: 36px;
  margin-right: 10px;
  margin-bottom: 5px;
  > button {
    padding: 3px;
  }
  svg {
    font-size: 30px;
  }
`;

const StudentInfoContainer = styled.div`
  flex: 1;
  margin-right: 20px;
`;

const NoPlanContainer = styled.div`
  display: flex;
  height: 100%;
  justify-content: center;
  align-items: center;
`;

const StudentInfoDisplay = styled.div`
  height: 100%;
`;

const AvatarWrapper = styled.div`
  height: 25%;
  > * {
    background-color: #d3898d !important;
    color: #fff !important;
    font-size: 5vw !important;
    margin: 0% 10% !important;
    width: 80% !important;
    height: 100% !important;
  }
`;

const StudentInfoTextWrapper = styled.div`
  height: 25%;
  justify-content: center;
  display: flex;
  flex-direction: column;
  > * {
  }
`;
const Text = styled.div`
  font-size: 12px;
  font-weight: normal;
  line-height: 20px;
`;
const NameText = styled.div`
  line-height: 28px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
`;
const TitleText = styled.div`
  font-size: 24px;
  line-height: 20px;
  font-weight: 500;
`;
const PlanText = styled.div`
  font-size: 14px;
  font-weight: 500;
  line-height: 28px;
`;
const PlanListContainer = styled.div`
  width: 100%;
  height: 35%;
  overflow: hidden;
  &:hover {
    overflow-y: auto;
  }
`;
const ButtonContainer = styled.div`
  margin: 5% 0%;
  justify-content: center;
  display: flex;
`;

const ExpandedStudentContainer = styled.div`
  margin-top: 12px;
  border: 1px solid red;
  border-radius: 10px;
  padding: 30px;
`;

const BackToStudentLink = styled.div`
  color: red;
  font-size: 16px;
  text-decoration: underline;
  cursor: pointer;
`;

const EMPTY_STUDENT_LIST: StudentProps[] = [];

type StudentViewMode = "overview" | "viewSchedule" | "editSchedule";

interface StudentsListProps {
  searchQuery: string;
  setSelectedStudent: (studentId: number | null) => void;
}

interface StudentsAPI {
  students: StudentProps[];
  nextPage: number;
  lastPage: boolean;
}

interface StudentProps {
  fullName: string;
  nuId: string;
  email: string;
  id: number;
}

interface StudentComponentProps extends StudentProps {
  setSelectedStudent: (studentId: number | null) => void;
}

interface StudentViewProps {
  id: number;
}

interface ExpandedStudentPlanProps {
  editMode: boolean;
  onEditPress: () => void;
  onStopEditPress: () => void;
  onFullScreenPress: () => void;
}

const ManageStudentsComponent: React.FC = (props: any) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);

  return (
    <Container>
      <Search
        placeholder="Search by name, email, or NUID"
        onEnter={query => {
          setSearchQuery(query);
          setSelectedStudent(null);
        }}
        isSmall={false}
      />
      {selectedStudent === null ? (
        <StudentsList
          searchQuery={searchQuery}
          setSelectedStudent={setSelectedStudent}
        />
      ) : (
        <StudentView id={selectedStudent} />
      )}
    </Container>
  );
};

const StudentView = ({ id }: StudentViewProps) => {
  const [fetchingStudent, setFetchingStudent] = useState(true);
  const [student, setStudent] = useState<IUserData | null>(null);
  const [noPlans, setNoPlans] = useState(false);
  const [viewMode, setViewMode] = useState<StudentViewMode>("overview");

  const dispatch = useDispatch();
  const { planName } = useSelector((state: AppState) => ({
    planName: getActivePlanNameFromState(state),
  }));

  useEffect(() => {
    fetchUser(id).then(response => {
      dispatch(setUserAction(response.user));
      setStudent(response.user);
      setFetchingStudent(false);
    });
    findAllPlansForUser(id).then((plans: IPlanData[]) => {
      dispatch(setUserPlansAction(plans, 2020));
      if (!plans || !plans.length || !plans[0].schedule) setNoPlans(true);
    });
    return () => {
      dispatch(resetUserAction());
    };
  }, []);

  if (viewMode === "overview") {
    return (
      <StudentViewContainer>
        <StudentInfoContainer>
          {!student && !fetchingStudent ? (
            <NoPlanContainer>
              <Text>User Has No Plans</Text>
            </NoPlanContainer>
          ) : fetchingStudent ? (
            <LoadingSpinner />
          ) : (
            <StudentInfoDisplay>
              <AvatarWrapper>
                <Avatar>{student!.fullName[0]}</Avatar>
              </AvatarWrapper>
              <StudentInfoTextWrapper>
                <NameText>{student!.fullName}</NameText>
                <Text>{student!.email}</Text>
                <Text>{student!.major}</Text>
                <Text>{student!.coopCycle}</Text>
              </StudentInfoTextWrapper>

              <PlanText>Plans:</PlanText>
              <PlanListContainer>
                <SwitchPlanList />
              </PlanListContainer>
              <ButtonContainer>
                <ColoredButton onClick={() => {}}>
                  Assign Template
                </ColoredButton>
              </ButtonContainer>
            </StudentInfoDisplay>
          )}
        </StudentInfoContainer>
        <SchedulePreviewContainer>
          {noPlans ? (
            <NoPlanContainer>
              <Text>User Has No Plans</Text>
            </NoPlanContainer>
          ) : (
            <>
              <PlanTitle>
                <TitleText>{planName}</TitleText>
              </PlanTitle>
              <ButtonHeader>
                <Tooltip title="Edit this student's plan">
                  <IconButton onClick={() => setViewMode("editSchedule")}>
                    <Edit />
                  </IconButton>
                </Tooltip>
                <IconButton onClick={() => setViewMode("viewSchedule")}>
                  <Fullscreen />
                </IconButton>
              </ButtonHeader>
              <ScheduleWrapper>
                <NonEditableSchedule />
              </ScheduleWrapper>
            </>
          )}
        </SchedulePreviewContainer>
      </StudentViewContainer>
    );
  } else {
    // full schedule view
    return (
      <ExpandedStudentPlan
        editMode={viewMode === "editSchedule"}
        onEditPress={() => setViewMode("editSchedule")}
        onStopEditPress={() => setViewMode("viewSchedule")}
        onFullScreenPress={() => setViewMode("overview")}
      />
    );
  }
};

const ExpandedStudentPlan: React.FC<ExpandedStudentPlanProps> = props => {
  const { planName, planMajor, planCoopCycle, fullName } = useSelector(
    (state: AppState) => ({
      planName: getActivePlanNameFromState(state),
      planMajor: getActivePlanMajorFromState(state),
      planCoopCycle: getActivePlanCoopCycleFromState(state),
      fullName: getUserFullNameFromState(state),
    })
  );

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(expandAllYearsForActivePlanAction());
  }, []);

  return (
    <FullScheduleViewContainer>
      <ExpandedScheduleStudentInfo>
        <IconButton onClick={props.onFullScreenPress}>
          <ArrowBack />
        </IconButton>
        <b style={{ marginRight: 12 }}>{fullName}</b>
        {planMajor || ""} {planCoopCycle || ""}
      </ExpandedScheduleStudentInfo>
      <ExpandedStudentContainer>
        <PlanTitle>{planName}</PlanTitle>
        <ButtonHeader>
          {props.editMode && <AutoSavePlan />}
          {props.editMode ? (
            <Tooltip title="Finished Editing">
              <IconButton onClick={props.onStopEditPress}>
                <Check />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Edit this student's plan">
              <IconButton onClick={props.onEditPress}>
                <Edit />
              </IconButton>
            </Tooltip>
          )}
          <IconButton onClick={props.onFullScreenPress}>
            <FullscreenExit />
          </IconButton>
        </ButtonHeader>
        <ScheduleWrapper>
          {props.editMode ? (
            <EditableSchedule transferCreditPresent collapsibleYears={false} />
          ) : (
            <NonEditableScheduleStudentView
              transferCreditPresent
              collapsibleYears={false}
            />
          )}
        </ScheduleWrapper>
      </ExpandedStudentContainer>
    </FullScheduleViewContainer>
  );
};

const StudentsList = ({
  searchQuery,
  setSelectedStudent,
}: StudentsListProps) => {
  const [students, setStudents] = useState(EMPTY_STUDENT_LIST);
  const [isLoading, setIsLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(0);
  const [isLastPage, setIsLastPage] = useState(false);

  const fetchStudents = (currentStudents: StudentProps[], page: number) => {
    setIsLoading(true);
    getStudents(searchQuery, page)
      .then((studentsAPI: StudentsAPI) => {
        setStudents(currentStudents.concat(studentsAPI.students));
        setPageNumber(studentsAPI.nextPage);
        setIsLastPage(studentsAPI.lastPage);
        setIsLoading(false);
      })
      .catch(err => console.log(err));
  };

  useEffect(() => {
    setStudents(EMPTY_STUDENT_LIST);
    fetchStudents(EMPTY_STUDENT_LIST, 0);
  }, [searchQuery]);

  return (
    <StudentListContainer>
      {isLoading ? (
        <Loading>
          <LinearProgress color="secondary" />
        </Loading>
      ) : null}
      <StudentListScrollContainer>
        {(students === null || students.length == 0) && !isLoading ? (
          <EmptyState> No students found </EmptyState>
        ) : (
          students.map(student => (
            <Student
              key={student.nuId}
              setSelectedStudent={setSelectedStudent}
              {...student}
            />
          ))
        )}
        {!isLoading ? (
          isLastPage ? (
            <NoMoreStudents>No more students</NoMoreStudents>
          ) : (
            <LoadMoreStudents
              onClick={() => fetchStudents(students, pageNumber)}
            >
              Load more students
            </LoadMoreStudents>
          )
        ) : null}
      </StudentListScrollContainer>
    </StudentListContainer>
  );
};

const Student = (props: StudentComponentProps) => {
  const { email, fullName, nuId, id, setSelectedStudent } = props;
  return (
    <StudentContainer onClick={() => setSelectedStudent(id)}>
      {fullName}
      <StudentEmailNUIDContainer>
        {email + " | " + nuId}
      </StudentEmailNUIDContainer>
    </StudentContainer>
  );
};

export const ManageStudents = withRouter(ManageStudentsComponent);
