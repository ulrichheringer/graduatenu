import { Box } from "@chakra-ui/react";
import {
  IAndCourse2,
  ICourseRange2,
  IOrCourse2,
  IRequiredCourse,
  IXofManyCourse,
  Requirement2,
  ScheduleCourse2,
  Section,
} from "@graduate/common";
import { DraggableScheduleCourse } from "../ScheduleCourse";
import SidebarSection from "./SidebarSection";

interface SidebarRequirementProps {
  requirement: Requirement2;
  courseData: { [id: string]: ScheduleCourse2<null> };
  dndIdPrefix: string;
}

const SectionRequirement: React.FC<SidebarRequirementProps> = ({
  requirement,
  courseData,
  dndIdPrefix,
}) => {
  const renderRequirement = () => {
    switch (requirement.type) {
      case "XOM":
        return renderXOM(requirement);
      case "AND":
        return renderAND(requirement);
      case "OR":
        return renderOR(requirement);
      case "RANGE":
        return renderRange(requirement);
      case "COURSE":
        return renderCourse(requirement);
      case "SECTION":
        return renderSection(requirement);
      default:
        throw new Error(`Unreachable code! Unknown sidebar section type.`);
    }
  };

  const renderXOM = (requirement: IXofManyCourse) => {
    return (
      <div>
        <p>Complete {requirement.numCreditsMin} credits from the following</p>
        {requirement.courses.map((course, index) => (
          <SectionRequirement
            requirement={course}
            courseData={courseData}
            dndIdPrefix={dndIdPrefix + "-" + index}
            key={index}
          />
        ))}
      </div>
    );
  };

  const renderAND = (requirement: IAndCourse2) => {
    return (
      <div>
        <p>Complete all of the following</p>
        {requirement.courses.map((course, index) => (
          <SectionRequirement
            requirement={course}
            courseData={courseData}
            dndIdPrefix={dndIdPrefix + "-" + index}
            key={index}
          />
        ))}
      </div>
    );
  };

  const renderOR = (requirement: IOrCourse2) => {
    return (
      <div>
        <p>Complete one of the following</p>
        {requirement.courses.map((course, index) => (
          <SectionRequirement
            requirement={course}
            courseData={courseData}
            dndIdPrefix={dndIdPrefix + "-" + index}
            key={index}
          />
        ))}
      </div>
    );
  };

  const renderRange = (requirement: ICourseRange2) => {
    return (
      <p>
        Complete any course in range {requirement.subject}
        {requirement.idRangeStart} to {requirement.subject}
        {requirement.idRangeEnd}
      </p>
    );
  };

  const renderCourse = (requirement: IRequiredCourse) => {
    const courseKey = `${requirement.subject}${requirement.classId}`;
    const scheduleCourse = courseData[courseKey];

    if (scheduleCourse) {
      return (
        <DraggableScheduleCourse
          scheduleCourse={{
            ...scheduleCourse,
            id: dndIdPrefix + "-" + courseKey,
          }}
          isFromSidebar={true}
          isDisabled={false}
        />
      );
    }
    return (
      <p>
        Course not found ({requirement.subject}
        {requirement.classId})
      </p>
    );
  };

  const renderSection = (requirement: Section) => {
    return (
      <SidebarSection
        section={requirement}
        courseData={courseData}
        dndIdPrefix={dndIdPrefix + "-sec"}
      />
    );
  };

  return (
    <Box pl="xs" pt="xs">
      {renderRequirement()}
    </Box>
  );
};

export default SectionRequirement;