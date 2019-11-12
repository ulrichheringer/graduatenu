import React from "react";
import "./App.css";
import { DragDropContext } from "react-beautiful-dnd";
import { mockData } from "./data/mockData";
import {
  DNDScheduleTerm,
  DNDSchedule,
  DNDScheduleYear,
  DNDScheduleCourse,
  NamedScheduleCourse,
} from "./models/types";
import styled from "styled-components";
import { Year } from "./components/Year/Year";
import { convertTermIdToYear, convertTermIdToSeason } from "./utils";

const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: start;
  align-items: start;
  margin: 30px;
  background-color: "#ff76ff";
`;

const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 12px;
`;

const Button = styled.button`
	width: 100px;
	border 1px solid black;
	padding: 8px;
	margin-right: 20px;
`;

const ButtonText = styled.div`
  text-align: center;
`;

interface AppState {
  schedule: DNDSchedule;
  currentClassCounter: number; // used for DND purposes, every class needs a unique ID
}

export default class App extends React.Component<{}, AppState> {
  constructor(props: any) {
    super(props);

    this.state = { schedule: mockData, currentClassCounter: 0 };
  }

  onDragEnd = (result: any) => {
    const { destination, source } = result;

    if (
      !destination ||
      (destination.droppableId === source.droppableId &&
        destination.index === source.index)
    ) {
      return;
    }

    const sourceSemesterSeason = convertTermIdToSeason(source.droppableId);
    const sourceSemesterYear = convertTermIdToYear(source.droppableId);
    const startYear: DNDScheduleYear = this.state.schedule.yearMap[
      sourceSemesterYear
    ];
    const startSemester: DNDScheduleTerm = (startYear as any)[
      sourceSemesterSeason
    ];

    const destSemesterSeason = convertTermIdToSeason(destination.droppableId);
    const destSemesterYear = convertTermIdToYear(destination.droppableId);
    const finishYear: DNDScheduleYear = this.state.schedule.yearMap[
      destSemesterYear
    ];
    const finishSemester: DNDScheduleTerm = (finishYear as any)[
      destSemesterSeason
    ];

    if (startSemester === finishSemester) {
      const newClassOrder = Array.from(startSemester.classes);
      const movedClass = newClassOrder[source.index];
      newClassOrder.splice(source.index, 1);
      newClassOrder.splice(destination.index, 0, movedClass);

      const newSemester: DNDScheduleTerm = {
        ...startSemester,
        classes: newClassOrder,
      };

      const newSemesterYear = convertTermIdToYear(newSemester.termId);
      const newSemesterSeason = convertTermIdToSeason(newSemester.termId);

      const newState: AppState = {
        ...this.state,
        schedule: {
          ...this.state.schedule,
          // semesters: {
          //   ...this.state.schedule.semesters,
          //   [newSemester.id]: newSemester,
          // },
          yearMap: {
            ...this.state.schedule.yearMap,
            [newSemesterYear]: {
              ...this.state.schedule.yearMap[newSemesterYear],
              [newSemesterSeason]: newSemester,
            },
          },
        },
      };

      this.setState(newState);
      return;
    }

    const startClasses = Array.from(startSemester.classes);
    const movedClass = startClasses[source.index];
    startClasses.splice(source.index, 1);
    const newStartSemester: DNDScheduleTerm = {
      ...startSemester,
      classes: startClasses,
    };

    const finishClasses = Array.from(finishSemester.classes);
    finishClasses.splice(destination.index, 0, movedClass);
    const newFinishSemester: DNDScheduleTerm = {
      ...finishSemester,
      classes: finishClasses,
    };

    const newStartSemesterYear = convertTermIdToYear(newStartSemester.termId);
    const newStartSemesterSeason = convertTermIdToSeason(
      newStartSemester.termId
    );
    const newFinishSemesterYear = convertTermIdToYear(newFinishSemester.termId);
    const newFinishSemesterSeason = convertTermIdToSeason(
      newFinishSemester.termId
    );

    let newState: AppState;

    if (newStartSemesterYear === newFinishSemesterYear) {
      // in same year
      newState = {
        ...this.state,
        schedule: {
          ...this.state.schedule,
          yearMap: {
            ...this.state.schedule.yearMap,
            [newStartSemesterYear]: {
              ...this.state.schedule.yearMap[newStartSemesterYear],
              [newStartSemesterSeason]: newStartSemester,
              [newFinishSemesterSeason]: newFinishSemester,
            },
          },
        },
      };
    } else {
      newState = {
        ...this.state,
        schedule: {
          ...this.state.schedule,
          yearMap: {
            ...this.state.schedule.yearMap,
            [newStartSemesterYear]: {
              ...this.state.schedule.yearMap[newStartSemesterYear],
              [newStartSemesterSeason]: newStartSemester,
            },
            [newFinishSemesterYear]: {
              ...this.state.schedule.yearMap[newFinishSemesterYear],
              [newFinishSemesterSeason]: newFinishSemester,
            },
          },
        },
      };
    }

    this.setState(newState);
  };

  renderYears() {
    return this.state.schedule.years.map((year: number, index: number) => (
      <Year
        index={index}
        schedule={this.state.schedule}
        handleAddClasses={this.handleAddClasses.bind(this)}
      />
    ));
  }
  handleAddClasses = async (courses: NamedScheduleCourse[], termId: number) => {
    // convert to DNDScheduleCourses
    const dndCourses = await this.convertToDNDCourses(courses);
    const year = convertTermIdToYear(termId);
    const season = convertTermIdToSeason(termId);

    this.setState({
      ...this.state,
      schedule: {
        ...this.state.schedule,
        yearMap: {
          ...this.state.schedule.yearMap,
          [year]: {
            ...this.state.schedule.yearMap[year],
            [season]: {
              ...(this.state.schedule.yearMap[year] as any)[season],
              classes: [
                ...(this.state.schedule.yearMap[year] as any)[season].classes,
                ...dndCourses,
              ],
            },
          },
        },
      },
    });
  };

  convertToDNDCourses = async (
    courses: NamedScheduleCourse[]
  ): Promise<DNDScheduleCourse[]> => {
    var list: DNDScheduleCourse[] = [];
    var counter = this.state.currentClassCounter;
    for (const course of courses) {
      counter++;
      list.push({
        ...course,
        dndId: String(counter),
      });
    }
    await this.setState({
      currentClassCounter: counter,
    });
    return list;
  };

  render() {
    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        <Container>
          <div onClick={() => console.log(this.state)}>
            <h2>Plan Of Study</h2>
          </div>
          <ButtonWrapper>
            <Button onClick={() => {}}>
              <ButtonText>Add a class</ButtonText>
            </Button>
            <Button onClick={() => {}}>
              <ButtonText>Search</ButtonText>
            </Button>
          </ButtonWrapper>
          {this.renderYears()}
        </Container>
      </DragDropContext>
    );
  }
}
