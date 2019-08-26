import * as fs from "fs";
import { ICompleteCourse, IInitialScheduleRep } from "../src/course_types";
import { audit_to_json } from "../src/html_parser";

const csJson = audit_to_json(fs.readFileSync("./test/mock_audits/cs_audit.html", "utf-8"));
const csJson2 = audit_to_json(fs.readFileSync("./test/mock_audits/cs_audit2.html", "utf-8"));
const csJson3 = audit_to_json(fs.readFileSync("./test/mock_audits/cs_audit3.html", "utf-8"));
const csMathJson = audit_to_json(fs.readFileSync("./test/mock_audits/cs_math_grad_audit.html", "utf-8"));
const meJson = audit_to_json(fs.readFileSync("./test/mock_audits/me_audit.html", "utf-8"));

const jsonEx: IInitialScheduleRep[] = [];
jsonEx.push(csJson);
jsonEx.push(csMathJson);
jsonEx.push(csJson2);
// json_ex.push(cs_json3);
// json_ex.push(me_json);

expect.extend({
    toHaveValidCompleteCourseForm(received: ICompleteCourse[]) {
        for (const completedCourse of received) {
            expect(typeof completedCourse.hon === typeof true).toBeTruthy();
            expect(completedCourse.subject).toMatch(/^[A-Z]{2,4}$/);
            expect(completedCourse.classId).toMatch(/^[\d]{4}$/);
            expect(completedCourse.creditHours).toMatch(/^[\d]\.00/);
            expect(completedCourse.season).toMatch(/FL|SP|S1|S2|SM/);
            expect(completedCourse.year).toMatch(/^\d\d$/);
            expect(completedCourse.termId).toMatch(/^20\d\d[1-6]0$/);
        }

        return {
            message: () => `Expected ${received} to have courses with data of the proper form.`,
            pass: true,
        };
    },
});

test("Confirms that the generated JavaScript object has the proper format for supplemental data", () => {
    for (const audit of jsonEx) {
        expect(audit.data.gradDate).toMatch(/^[0-3][0-9]\/[0-3][0-9]\/[0-9][0-9]$/);
        expect(audit.data.auditYear).toMatch(/^20[0-9][0-9]$/);

        for (const major of audit.data.majors) {
            expect(major).toMatch(/^[a-zA-Z ]+$/);
        }

        for (const minor of audit.data.minors) {
            expect(minor).toMatch(/^[a-zA-Z ]+$/);
        }
    }
});

test("Ensures that all of the complete course information is of the form required.", () => {
    for (const audit of jsonEx) {
        for (const completedCourse of audit.completed.courses) {
            expect(typeof completedCourse.hon === typeof true).toBeTruthy();
            expect(completedCourse.subject).toMatch(/^[A-Z]{2,4}$/);
            expect(completedCourse.classId).toMatch(/^[\d]{4}$/);
            expect(completedCourse.creditHours).toMatch(/^[\d]\.00/);
            expect(completedCourse.season).toMatch(/FL|SP|S1|S2|SM/);
            expect(completedCourse.year).toMatch(/^\d\d$/);
            expect(completedCourse.termId).toMatch(/^20\d\d[1-6]0$/);
        }
    }
});

test("Ensures that all of the in-progress course information is of the form required.", () => {
    for (const audit of jsonEx) {
        expect(audit.inprogress.courses)
    }
});

test("Ensures that all of the courses required to take are of the form required.", () => {
    for (const audit of jsonEx) {
        for (const requiredCourse of audit.requirements.courses) {
            expect(requiredCourse.subject).toMatch(/^[A-Z]{2,4}$/);

            if (typeof requiredCourse.classId  === "undefined") {
                expect(requiredCourse.num_required).toMatch(/^[\d]$/);

                for (const course of requiredCourse.list) {
                    expect(course).toMatch(/^[\d]{4}$/);
                }
            } else {
                expect(requiredCourse.classId).toMatch(/^[\d]{4}$/);
                if (typeof requiredCourse.classId2 !== "undefined") {
                    expect(requiredCourse.classId2).toMatch(/^[\d]{4}$/);
                }
            }
        }
    }
});

test("Ensures that the audits do not contain duplicate completed courses.", () => {
    for (let i = 0; i < jsonEx.length; i++) {
        let duplicates = false;
        for (let j = 0; j < jsonEx[i].completed.courses.length; j++) {
            const course = jsonEx[i].completed.courses[j];
            let seen = false;

            for (let k = 0; k < jsonEx[i].completed.courses.length; k++) {
                if (course.classId === jsonEx[i].completed.courses[k].classId
                    && course.subject === jsonEx[i].completed.courses[k].subject
                    && course.termId === jsonEx[i].completed.courses[k].termId
                    && course.name === jsonEx[i].completed.courses[k].name) {
                    if (!seen) {
                        seen = true;
                    } else {
                        duplicates = true;
                    }
                }
            }

            expect(duplicates).toBeFalsy();
            duplicates = false;
        }
    }
});

test("Ensures that the audits do not contain duplicate in-progress courses.", () => {
    for (let i = 0; i < jsonEx.length; i++) {
        let duplicates = false;
        for (let j = 0; j < jsonEx[i].inprogress.courses.length; j++) {
            const course = jsonEx[i].inprogress.courses[j];
            let seen = false;

            for (let k = 0; k < jsonEx[i].inprogress.courses.length; k++) {
                if (course.classId === jsonEx[i].inprogress.courses[k].classId 
                    && course.subject === jsonEx[i].inprogress.courses[k].subject 
                    && course.termId === jsonEx[i].inprogress.courses[k].termId) {
                    if (!seen) {
                        seen = true;
                    } else {
                        duplicates = true;
                    }
                }
            }

            expect(duplicates).toBeFalsy();
            duplicates = false;
        }
    }
});

test("Ensures that the audits do not contain duplicate required courses.", () => {

});

test("Ensures that the audits do not contain duplicate completed NUPaths.", () => {
    for (let i = 0; i < jsonEx.length; i++) {
        let duplicates = false;
        for (let j = 0; j < jsonEx[i].completed.nupaths.length; j++) {
            let seen = false;
            const nupath = jsonEx[i].completed.nupaths[j];
            for (let k = 0; k < jsonEx[i].completed.nupaths.length; k++) {
                if (jsonEx[i].completed.nupaths[k] === nupath) {
                    if (!seen) {
                        seen = true;
                    } else {
                        duplicates = true;
                    }
                }
            }

            expect(duplicates).toBeFalsy();
            duplicates = false;
        }
    }
});

test("Ensures that the audits do not contain duplicate in-progress NUPaths.", () => {
    for (let i = 0; i < jsonEx.length; i++) {
        let duplicates = false;
        for (let j = 0; j < jsonEx[i].inprogress.nupaths.length; j++) {
            let seen = false;
            const nupath = jsonEx[i].inprogress.nupaths[j];
            for (let k = 0; k < jsonEx[i].inprogress.nupaths.length; k++) {
                if (jsonEx[i].inprogress.nupaths[k] === nupath) {
                    if (!seen) {
                        seen = true;
                    } else {
                        duplicates = true;
                    }
                }
            }

            expect(duplicates).toBeFalsy();
            duplicates = false;
        }
    }
});

test("Ensures that the audits do not contain duplicate required NUPaths.", () => {
    for (let i = 0; i < jsonEx.length; i++) {
        let duplicates = false;
        for (let j = 0; j < jsonEx[i].requirements.nupaths.length; j++) {
            let seen = false;
            const nupath = jsonEx[i].requirements.nupaths[j];
            for (let k = 0; k < jsonEx[i].requirements.nupaths.length; k++) {
                if (jsonEx[i].requirements.nupaths[k] === nupath) {
                    if (!seen) {
                        seen = true;
                    } else {
                        duplicates = true;
                    }
                }
            }

            expect(duplicates).toBeFalsy();
            duplicates = false;
        }
    }
});

test("Ensures that each audit contains all of the NUPath requirements.", () => {
    for (let i = 0; i < jsonEx.length; i++) {
        const nupaths = ["ND", "EI", "IC", "FQ", "SI", "AD", "DD", "ER", "WF", "WD", "WI", "EX", "CE"];
        for (let j = 0; j < jsonEx[i].completed.nupaths.length; j++) {
            const index = nupaths.indexOf(jsonEx[i].completed.nupaths[j]);
            if (index > -1) {
                nupaths.splice(index, 1);
            }
        }

        for (let j = 0; j < jsonEx[i].inprogress.nupaths.length; j++) {
            const index = nupaths.indexOf(jsonEx[i].inprogress.nupaths[j]);
            if (index > -1) {
                nupaths.splice(index, 1);
            }
        }
        for (let j = 0; j < jsonEx[i].requirements.nupaths.length; j++) {
            const index = nupaths.indexOf(jsonEx[i].requirements.nupaths[j]);
            if (index > -1) {
                nupaths.splice(index, 1);
            }
        }

        expect(nupaths.length === 0).toBeTruthy();
    }
});

test("Verifies that the CS degree audit is properly reproduced by the code", () => {
    expect(csJson).toStrictEqual(
        {
            completed: {
                courses: [
                    {
                        classId: "1200",
                        creditHours: "1.00",
                        hon: false,
                        name: "LeadershipSkillDevelopment",
                        season: "FL",
                        subject: "CS",
                        termId: "201910",
                        year: "18",
                    },
                    {
                        hon: true,
                        subject: "CS",
                        classId: "1800",
                        name: "DiscreteStructures",
                        credithours: "4.00",
                        season: "FL",
                        year: "18",
                        termId: "201910",
                    },
                    {
                        hon: true,
                        subject: "CS",
                        classId: "1802",
                        name: "SeminarforCS1800",
                        credithours: "1.00",
                        season: "FL",
                        year: "18",
                        termId: "201910",
                    },
                    {
                        hon: false,
                        subject: "CS",
                        classId: "2500",
                        name: "FundamentalsofComputerSci",
                        credithours: "4.00",
                        season: "FL",
                        year: "18",
                        termId: "201910",
                    },
                    {
                        hon: false,
                        subject: "CS",
                        classId: "2501",
                        name: "LabforCS2500",
                        credithours: "1.00",
                        season: "FL",
                        year: "18",
                        termId: "201910",
                    },
                    {
                        hon: false,
                        subject: "CS",
                        classId: "2510",
                        name: "FundamentalsofComputerSci",
                        credithours: "4.00",
                        season: "SP",
                        year: "19",
                        termId: "201930",
                    },
                    {
                        hon: false,
                        subject: "CS",
                        classId: "2511",
                        name: "LabforCS2510",
                        credithours: "1.00",
                        season: "SP",
                        year: "19",
                        termId: "201930",
                    },
                    {
                        hon: false,
                        subject: "CS",
                        classId: "2800",
                        name: "LogicandComputation",
                        credithours: "4.00",
                        season: "SP",
                        year: "19",
                        termId: "201930",
                    },
                    {
                        hon: false,
                        subject: "CS",
                        classId: "2801",
                        name: "LabforCS2800",
                        credithours: "1.00",
                        season: "SP",
                        year: "19",
                        termId: "201930",
                    },
                    {
                        hon: false,
                        subject: "CS",
                        classId: "3200",
                        name: "DatabaseDesign",
                        credithours: "4.00",
                        season: "SP",
                        year: "19",
                        termId: "201930",
                    },
                    {
                        hon: false,
                        subject: "CS",
                        classId: "3950",
                        name: "IntrotoCSResearch",
                        credithours: "2.00",
                        season: "SP",
                        year: "19",
                        termId: "201930",
                    },
                    {
                        hon: false,
                        subject: "MATH",
                        classId: "1341",
                        name: "CalculusBC++",
                        credithours: "4.00",
                        season: "S2",
                        year: "18",
                        termId: "201860",
                    },
                    {
                        hon: false,
                        subject: "MATH",
                        classId: "1342",
                        name: "CalculusBC++",
                        credithours: "4.00",
                        season: "S2",
                        year: "18",
                        termId: "201860",
                    },
                    {
                        hon: false,
                        subject: "MATH",
                        classId: "2331",
                        name: "LinearAlgebra",
                        credithours: "4.00",
                        season: "FL",
                        year: "18",
                        termId: "201910",
                    },
                    {
                        hon: true,
                        subject: "PHIL",
                        classId: "1145",
                        name: "TechandHumanValues",
                        credithours: "4.00",
                        season: "FL",
                        year: "18",
                        termId: "201910",
                    },
                    {
                        hon: false,
                        subject: "BIOL",
                        classId: "1111",
                        name: "AP:BIOLOGY",
                        credithours: "4.00",
                        season: "S2",
                        year: "18",
                        termId: "201860",
                    },
                    {
                        hon: false,
                        subject: "BIOL",
                        classId: "1112",
                        name: "AP:BIOLOGY",
                        credithours: "1.00",
                        season: "S2",
                        year: "18",
                        termId: "201860",
                    },
                    {
                        hon: false,
                        subject: "BIOL",
                        classId: "1113",
                        name: "AP:BIOLOGY",
                        credithours: "4.00",
                        season: "S2",
                        year: "18",
                        termId: "201860",
                    },
                    {
                        hon: false,
                        subject: "BIOL",
                        classId: "1114",
                        name: "AP:BIOLOGY",
                        credithours: "1.00",
                        season: "S2",
                        year: "18",
                        termId: "201860",
                    },
                    {
                        hon: false,
                        subject: "ENGW",
                        classId: "1111",
                        name: "AP:ENGLANG/COMP,ENGL",
                        credithours: "8.00",
                        season: "S2",
                        year: "18",
                        termId: "201860",
                    },
                    {
                        hon: false,
                        subject: "CS",
                        classId: "1990",
                        name: "AP:COMPSCIA",
                        credithours: "4.00",
                        season: "S2",
                        year: "18",
                        termId: "201860",
                    },
                    {
                        hon: false,
                        subject: "ECON",
                        classId: "1115",
                        name: "AP:ECON-MAC",
                        credithours: "4.00",
                        season: "S2",
                        year: "18",
                        termId: "201860",
                    },
                    {
                        hon: false,
                        subject: "ECON",
                        classId: "1116",
                        name: "AP:ECON-MIC",
                        credithours: "4.00",
                        season: "S2",
                        year: "18",
                        termId: "201860",
                    },
                    {
                        hon: false,
                        subject: "HIST",
                        classId: "1110",
                        name: "AP:WORLDHISTORY",
                        credithours: "4.00",
                        season: "S2",
                        year: "18",
                        termId: "201860",
                    },
                    {
                        hon: false,
                        subject: "MATH",
                        classId: "2280",
                        name: "AP:STATISTICS",
                        credithours: "4.00",
                        season: "S2",
                        year: "18",
                        termId: "201860",
                    },
                    {
                        hon: false,
                        subject: "PHYS",
                        classId: "1151",
                        name: "AP:PHYSICSC-MECH",
                        credithours: "3.00",
                        season: "S2",
                        year: "18",
                        termId: "201860",
                    },
                    {
                        hon: false,
                        subject: "PHYS",
                        classId: "1152",
                        name: "AP:PHYSICSC-MECH",
                        credithours: "1.00",
                        season: "S2",
                        year: "18",
                        termId: "201860",
                    },
                    {
                        hon: false,
                        subject: "PHYS",
                        classId: "1153",
                         name: "AP:PHYSICSC-MECH",
                        credithours: "1.00",
                        season: "S2",
                        year: "18",
                        termId: "201860",
                    },
                    {
                        hon: false,
                        subject: "PSYC",
                        classId: "1101",
                        name: "AP:PSYCHOLOGY",
                        credithours: "4.00",
                        season: "S2",
                        year: "18",
                        termId: "201860",
                    },
                    {
                        hon: true,
                        subject: "HONR",
                        classId: "1102",
                        name: "HonorsDiscovery",
                        credithours: "1.00",
                        season: "FL",
                        year: "18",
                        termId: "201910",
                    },
                ],
                nupaths: [
                    "ND",
                    "FQ",
                    "SI",
                    "AD",
                    "ER",
                    "WF",
                ],
            },
            inprogress: {
                courses: [
                    {
                        hon: false,
                        subject: "CS",
                        classId: "3000",
                        name: "Algorithms&Data",
                        credithours: "4.00",
                        season: "FL",
                        year: "19",
                        termId: "202010",
                    },
                    {
                        hon: false,
                        subject: "CS",
                        classId: "3500",
                        name: "Object-OrientedDesign",
                        credithours: "4.00",
                        season: "S1",
                        year: "19",
                        termId: "201940",
                    },
                    {
                        hon: false,
                        subject: "CS",
                        classId: "3650",
                        name: "ComputerSystems",
                        credithours: "4.00",
                        season: "FL",
                        year: "19",
                        termId: "202010",
                    },
                    {
                        hon: false,
                        subject: "CS",
                        classId: "4100",
                        name: "ArtificialIntelligence",
                        credithours: "4.00",
                        season: "FL",
                        year: "19",
                        termId: "202010",
                    },
                    {
                        hon: false,
                        subject: "CS",
                        classId: "4950",
                        name: "MachineLearnResearchSemina",
                        credithours: "1.00",
                        season: "FL",
                        year: "19",
                        termId: "202010",
                    },
                    {
                        hon: false,
                        subject: "MATH",
                        classId: "3081",
                        name: "ProbabilityandStatistics",
                        credithours: "4.00",
                        season: "FL",
                        year: "19",
                        termId: "202010",
                    },
                    {
                        hon: false,
                        subject: "EECE",
                        classId: "2160",
                        name: "EmbeddedDesEnablingRobotic",
                        credithours: "4.00",
                        season: "S1",
                        year: "19",
                        termId: "201940",
                    },
                ],
                nupaths: [
                    "CE",
                ],
            },
            requirements: {
                courses: [
                    {
                        subject: "CS",
                        classId: "1210",
                    },
                    {
                        subject: "CS",
                        classId: "3700",
                    },
                    {
                        subject: "CS",
                        classId: "3800",
                    },
                    {
                        subject: "CS",
                        classId: "4400",
                    },
                    {
                        subject: "CS",
                        classId: "4500",
                    },
                    {
                        subject: "THTR",
                        classId: "1170",
                    },
                    {
                        subject: "CS",
                        classId: "2500",
                        classId2: "7999",
                    },
                    {
                        classId: "2000",
                        classId2: "7999",
                        subject: "DS",
                    },
                    {
                        subject: "ENGW",
                        list: [
                            "3302",
                            "3308",
                            "3315",
                        ],
                        num_required: "1",
                    },
                ],
                nupaths: [
                    "EI",
                    "IC",
                    "DD",
                    "WI",
                    "WD",
                    "EX",
                ],
            },
            "data": {
                grad: "08/20/22",
                year: "2019",
                "major": "Computer Science",
            },
        });
});
test("Verifies that the second Computer Science degree audit is properly reproduced by the code", () => {
    expect(csJson2).toStrictEqual(
        {
            completed: {
                courses: [
                    { hon: false,
                        subject: "CS",
                        classId: "1200",
                        name: "LeadershipSkillDevelopment",
                        credithours: "1.00",
                        season: "FL",
                        year: "18",
                        termId: "201910",
                    },
                    {
                        hon: false,
                        subject: "CS",
                        classId: "1800",
                        name: "DiscreteStructures",
                        credithours: "4.00",
                        season: "FL",
                        year: "18",
                        termId: "201910",
                    },
                    {
                        hon: false,
                        subject: "CS",
                        classId: "1802",
                        name: "SeminarforCS1800",
                        credithours: "1.00",
                        season: "FL",
                        year: "18",
                        termId: "201910",
                    },
                    {
                        hon: false,
                        subject: "CS",
                        classId: "2500",
                        name: "FundamentalsofComputerSci",
                        credithours: "4.00",
                        season: "FL",
                        year: "18",
                        termId: "201910",
                    },
                    {
                        hon: false,
                        subject: "CS",
                        classId: "2501",
                        name: "LabforCS2500",
                        credithours: "1.00",
                        season: "FL",
                        year: "18",
                        termId: "201910",
                    },
                    {
                        hon: false,
                        subject: "CS",
                        classId: "2510",
                        name: "FundamentalsofComputerSci",
                        credithours: "4.00",
                        season: "SP",
                        year: "19",
                        termId: "201930",
                    },
                    {
                        hon: false,
                        subject: "CS",
                        classId: "2511",
                        name: "LabforCS2510",
                        credithours: "1.00",
                        season: "SP",
                        year: "19",
                        termId: "201930",
                    },
                    {
                        hon: false,
                        subject: "CS",
                        classId: "2800",
                         name: "LogicandComputation",
                        credithours: "4.00",
                        season: "SP",
                        year: "19",
                        termId: "201930",
                    },
                    {
                        hon: false,
                        subject: "CS",
                        classId: "2801",
                        name: "LabforCS2800",
                        credithours: "1.00",
                        season: "SP",
                        year: "19",
                        termId: "201930",
                    },
                    {
                        hon: false,
                        subject: "CS",
                        classId: "2550",
                        name: "FoundationsofCybersecurity",
                        credithours: "4.00",
                        season: "SP",
                        year: "19",
                        termId: "201930",
                    },
                    {
                        hon: false,
                        subject: "MATH",
                        classId: "1341",
                        name: "CalculusBC++",
                        credithours: "4.00",
                        season: "S2",
                        year: "18",
                        termId: "201860",
                    },
                    {
                        hon: false,
                        subject: "MATH",
                        classId: "1342",
                        name: "CalculusBC++",
                        credithours: "4.00",
                        season: "S2",
                        year: "18",
                        termId: "201860",
                    },
                    {
                        hon: false,
                        subject: "MATH",
                        classId: "3081",
                        name: "ProbabilityandStatistics",
                        credithours: "4.00",
                        season: "S1",
                        year: "19",
                        termId: "201940",
                    },
                    {
                        hon: false,
                        subject: "EECE",
                        classId: "2160",
                        name: "EmbeddedDesEnablingRobotic",
                        credithours: "4.00",
                        season: "S1",
                        year: "19",
                        termId: "201940",
                    },
                    {
                        hon: false,
                        subject: "PHYS",
                        classId: "1151",
                        name: "AP:PHYSICSC-MECH",
                        credithours: "3.00",
                        season: "S2",
                        year: "18",
                        termId: "201860",
                    },
                    {
                        hon: false,
                        subject: "PHYS",
                        classId: "1152",
                        name: "AP:PHYSICSC-MECH",
                        credithours: "1.00",
                        season: "S2",
                        year: "18",
                        termId: "201860",
                    },
                    {
                        hon: false,
                        subject: "PHYS",
                        classId: "1153",
                        name: "AP:PHYSICSC-MECH",
                        credithours: "1.00",
                        season: "S2",
                        year: "18",
                        termId: "201860",
                    },
                    {
                        hon: false,
                        subject: "PHYS",
                        classId: "1155",
                        name: "PhysicsforEngineering2",
                        credithours: "3.00",
                        season: "FL",
                        year: "18",
                        termId: "201910",
                    },
                    {
                        hon: false,
                        subject: "PHYS",
                        classId: "1156",
                        name: "LabforPHYS1155",
                        credithours: "1.00",
                        season: "FL",
                        year: "18",
                        termId: "201910",
                    },
                    {
                        hon: false,
                        subject: "PHYS",
                        classId: "1157",
                        name: "InteractLearnforPHYS1155",
                        credithours: "1.00",
                        season: "FL",
                        year: "18",
                        termId: "201910",
                    },
                    {
                        hon: false,
                        subject: "ENGW",
                        classId: "1111",
                        name: "AP:ENGLANG/COMP",
                        credithours: "4.00",
                        season: "S2",
                        year: "18",
                        termId: "201860",
                    },
                    {
                        hon: false,
                        subject: "CS",
                        classId: "1990",
                        name: "AP:COMPSCIA",
                        credithours: "4.00",
                        season: "S2",
                        year: "18",
                        termId: "201860",
                    },
                    {
                        hon: false,
                        subject: "CS",
                        classId: "1990",
                        name: "AP:COMPSCIPRINCI",
                        credithours: "4.00",
                        season: "S2",
                        year: "18",
                        termId: "201860",
                    },
                    {
                        hon: false,
                        subject: "HIST",
                        classId: "1130",
                        name: "AP:USHISTORY",
                        credithours: "4.00",
                        season: "S2",
                        year: "18",
                        termId: "201860",
                    },
                    {
                        hon: false,
                        subject: "MATH",
                        classId: "2321",
                        name: "Calculus3forSci/Engr",
                        credithours: "4.00",
                        season: "FL",
                        year: "18",
                        termId: "201910",
                    },
                    {
                        hon: true,
                        subject: "HONR",
                        classId: "1310",
                        name: "IllusionsofReality",
                        credithours: "4.00",
                        season: "SP",
                        year: "19",
                        termId: "201930",
                    },
                ],
                nupaths: [
                    "ND",
                    "IC",
                    "FQ",
                    "AD",
                    "DD",
                    "WF",
                ],
            },
            inprogress: {
                courses: [
                    {
                        hon: false,
                        subject: "CS",
                        classId: "3000",
                        name: "Algorithms&Data",
                        credithours: "4.00",
                        season: "S2",
                        year: "19",
                        termId: "201960",
                    },
                    {
                        hon: false,
                        subject: "CS",
                        classId: "3500",
                        name: "Object-OrientedDesign",
                        credithours: "4.00",
                        season: "FL",
                        year: "19",
                        termId: "202010",
                    },
                    {
                        hon: false,
                        subject: "CS",
                        classId: "3650",
                        name: "ComputerSystems",
                        credithours: "4.00",
                        season: "FL",
                        year: "19",
                        termId: "202010",
                    },
                    {
                        hon: false,
                        subject: "CS",
                        classId: "3800",
                        name: "TheoryofComputation",
                        credithours: "4.00",
                        season: "FL",
                        year: "19",
                        termId: "202010",
                    },
                    {
                        hon: false,
                        subject: "MATH",
                        classId: "2331",
                        name: "LinearAlgebra",
                        credithours: "4.00",
                        season: "S2",
                        year: "19",
                        termId: "201960",
                    },
                    {
                        hon: true,
                        subject: "PHIL",
                        classId: "1145",
                        name: "TechandHumanValues",
                        credithours: "4.00",
                        season: "FL",
                        year: "19",
                        termId: "202010",
                    },
                ],
                nupaths: [
                    "SI",
                    "ER",
                ],
            },
            requirements: {
                courses: [
                    {
                        subject: "CS",
                        classId: "1210",
                    },
                    {
                        subject: "CS",
                        classId: "3700",
                    },
                    {
                        subject: "CS",
                        classId: "4400",
                    },
                    {
                        subject: "CS",
                        classId: "4500",
                    },
                    {
                        subject: "THTR",
                        classId: "1170",
                    },
                    {
                        subject: "CS",
                        list: [ "4100", "4300", "4410", "4150", "4550", "4991"],
                        num_required: "1",
                    },
                    {
                        subject: "IS",
                        classId: "4900",
                    },
                    {
                        subject: "CS",
                        classId: "2500",
                        classId2: "7999",
                    },
                    {
                        subject: "DS",
                        classId: "2000",
                        classId2: "7999",
                    },
                    {
                        subject: "ENGW",
                        list: [ "3302", "3308", "3315" ],
                        num_required: "1",
                    },
                ],
                nupaths: [
                    "EI",
                    "WI",
                    "WD",
                    "EX",
                    "CE",
                ],
            },
            "data": {
                grad: "08/20/22",
                year: "2019",
                "major": "Computer Science",
            },
        });
});

test("Verifies that the CS Math degree audit is properly reproduced by the code", () => {
    expect(csMathJson).toStrictEqual(
        {
            completed: {
                courses: [
                    {
                        hon: false,
                        subject: "CS",
                        classId: "1200",
                         name: "LeadershipSkillDevelopment",
                        credithours: "1.00",
                        season: "FL",
                        year: "18",
                        termId: "201910",
                    },
                    {
                        hon: true,
                        subject: "CS",
                        classId: "1800",
                        name: "DiscreteStructures",
                        credithours: "4.00",
                        season: "FL",
                        year: "18",
                        termId: "201910",
                    },
                    {
                        hon: true,
                        subject: "CS",
                        classId: "1802",
                        name: "SeminarforCS1800",
                        credithours: "1.00",
                        season: "FL",
                        year: "18",
                        termId: "201910",
                    },
                    {
                        hon: false,
                        subject: "CS",
                        classId: "2500",
                        name: "FundamentalsofComputerSci",
                        credithours: "4.00",
                        season: "FL",
                        year: "18",
                        termId: "201910",
                    },
                    {
                        hon: false,
                        subject: "CS",
                        classId: "2501",
                        name: "LabforCS2500",
                        credithours: "1.00",
                        season: "FL",
                        year: "18",
                        termId: "201910",
                    },
                    {
                        hon: false,
                        subject: "CS",
                        classId: "4993",
                        name: "IndependentStudy",
                        credithours: "4.00",
                        season: "SP",
                        year: "19",
                        termId: "201930",
                    },
                    {
                        hon: false,
                        subject: "MATH",
                        classId: "1341",
                        name: "CalculusI",
                        credithours: "0.00",
                        season: "FL",
                        year: "16",
                        termId: "201710",
                    },
                    {
                        hon: false,
                        subject: "MATH",
                        classId: "1342",
                        name: "CalculusII",
                        credithours: "5.00",
                        season: "SP",
                        year: "17",
                        termId: "201730",
                    },
                    {
                        hon: false,
                        subject: "MATH",
                        classId: "2321",
                        name: "CalculusIII",
                        credithours: "5.00",
                        season: "FL",
                        year: "17",
                        termId: "201810",
                    },
                    {
                        hon: false,
                        subject: "MATH",
                        classId: "1341",
                        name: "AP:CALCULUSAB",
                        credithours: "4.00",
                        season: "S2",
                        year: "18",
                        termId: "201860",
                    },
                    {
                        hon: false,
                        subject: "MATH",
                        classId: "2331",
                        name: "LinearAlgebra",
                        credithours: "4.00",
                        season: "SP",
                        year: "19",
                        termId: "201930",
                    },
                    {
                        hon: false,
                        subject: "MATH",
                        classId: "3081",
                        name: "ProbabilityandStatistics",
                        credithours: "4.00",
                        season: "SP",
                        year: "19",
                        termId: "201930",
                    },
                    {
                        hon: true,
                        subject: "PHIL",
                        classId: "1145",
                        name: "TechandHumanValues",
                        credithours: "4.00",
                        season: "FL",
                        year: "18",
                        termId: "201910",
                    },
                    {
                        hon: false,
                        subject: "ENGW",
                        classId: "1111",
                        name: "AP:ENGLANG/COMP",
                        credithours: "0.00",
                        season: "S2",
                        year: "18",
                        termId: "201860",
                    },
                    {
                        classId: "1111",
                        credithours: "4.00",
                        hon: false,
                        name: "ENGLISHA:Literature",
                        season: "S2",
                        subject: "ENGW",
                        termId: "201860",
                        year: "18",
                    },
                    {
                        classId: "1990",
                        credithours: "3.00",
                        hon: false,
                        name: "Trigonometry",
                        season: "SM",
                        subject: "MATH",
                        termId: "201650",
                        year: "16",
                    },
                    {
                        hon: false,
                        subject: "MATH",
                        classId: "1990",
                        name: "PrecalculusAlgebra",
                        credithours: "3.00",
                        season: "SM",
                        year: "16",
                        termId: "201650",
                    },
                    {
                        hon: false,
                        subject: "ENGL",
                        classId: "3584",
                        name: "HarryPotterandtheImaginat",
                        credithours: "3.00",
                        season: "SM",
                        year: "17",
                        termId: "201750",
                    },
                    {
                        hon: false,
                        subject: "ARTS",
                        classId: "1990",
                        name: "Ceramics:WheelThrowing",
                        credithours: "3.00",
                        season: "SP",
                        year: "18",
                        termId: "201830",
                    },
                    {
                        hon: false,
                        subject: "CS",
                        classId: "1990",
                        name: "AP:COMPSCIA",
                        credithours: "4.00",
                        season: "S2",
                        year: "18",
                        termId: "201860",
                    },
                    {
                        hon: false,
                        subject: "ENGL",
                        classId: "1990",
                        name: "ENGLISHA:Literature",
                        credithours: "4.00",
                        season: "S2",
                        year: "18",
                        termId: "201860",
                    },
                    {
                        hon: false,
                        subject: "ENVR",
                        classId: "1101",
                        name: "AP:ENV.SCIENCE",
                        credithours: "4.00",
                        season: "S2",
                        year: "18",
                        termId: "201860",
                    },
                    {
                        hon: false,
                        subject: "HIST",
                        classId: "1130",
                        name: "AP:USHISTORY",
                        credithours: "0.00",
                        season: "S2",
                        year: "18",
                        termId: "201860",
                    },
                    {
                        classId: "1130",
                        credithours: "4.00",
                        hon: false,
                        name: "HistoryAmericas",
                        season: "S2",
                        subject: "HIST",
                        termId: "201860",
                        year: "18",
                    },
                    {
                        hon: false,
                        subject: "PHYS",
                        classId: "1145",
                        name: "AP:PHYSICS1",
                        credithours: "4.00",
                        season: "S2",
                        year: "18",
                        termId: "201860",
                    },
                    {
                        hon: false,
                        subject: "PHYS",
                        classId: "1146",
                        name: "AP:PHYSICS1",
                        credithours: "1.00",
                        season: "S2",
                        year: "18",
                        termId: "201860",
                    },
                    {
                        hon: false,
                        subject: "PHYS",
                        classId: "1161",
                        name: "IB:PHYSICS",
                        credithours: "4.00",
                        season: "S2",
                        year: "18",
                        termId: "201860",
                    },
                    {
                        hon: false,
                        subject: "PHYS",
                        classId: "1162",
                        name: "IB:PHYSICS",
                        credithours: "1.00",
                        season: "S2",
                        year: "18",
                        termId: "201860",
                    },
                    {
                        hon: false,
                        subject: "PHYS",
                        classId: "1165",
                        name: "IB:PHYSICS",
                        credithours: "4.00",
                        season: "S2",
                        year: "18",
                        termId: "201860",
                    },
                    {
                        hon: false,
                        subject: "PHYS",
                        classId: "1166",
                        name: "IB:PHYSICS",
                        credithours: "1.00",
                        season: "S2",
                        year: "18",
                        termId: "201860",
                    },
                    {
                        hon: false,
                        subject: "SOCL",
                        classId: "1990",
                        name: "AP:HUMANGEOGRAPHY",
                        credithours: "4.00",
                        season: "S2",
                        year: "18",
                        termId: "201860",
                    },
                    {
                        hon: false,
                        subject: "SPNS",
                        classId: "1990",
                        name: "AP:SPANISHLANG",
                        credithours: "4.00",
                        season: "S2",
                        year: "18",
                        termId: "201860",
                    },
                    {
                        hon: false,
                        subject: "ARTF",
                        classId: "1121",
                        name: "ConceptualDrawing",
                        credithours: "4.00",
                        season: "SP",
                        year: "19",
                        termId: "201930",
                    },
                    {
                        hon: false,
                        subject: "CS",
                        classId: "3950",
                        name: "IntrotoCSResearch",
                        credithours: "2.00",
                        season: "SP",
                        year: "19",
                        termId: "201930",
                    },
                    {
                        hon: true,
                        subject: "HONR",
                        classId: "1102",
                        name: "HonorsDiscovery",
                        credithours: "1.00",
                        season: "FL",
                        year: "18",
                        termId: "201910",
                    },
                    {
                        hon: true,
                        subject: "HONR",
                        classId: "1310",
                        name: "FutureofMoney",
                        credithours: "4.00",
                        season: "FL",
                        year: "18",
                        termId: "201910",
                    },
                ],
                nupaths: [
                    "ND",
                    "EI",
                    "IC",
                    "FQ",
                    "SI",
                    "AD",
                    "DD",
                    "ER",
                    "WF",
                ],
            },
            inprogress: {
                courses: [
                    {
                        hon: false,
                        subject: "CS",
                        classId: "3500",
                        name: "Object-OrientedDesign",
                        credithours: "4.00",
                        season: "S1",
                        year: "19",
                        termId: "201940",
                    },
                    {
                        hon: false,
                        subject: "CS",
                        classId: "5800",
                        name: "Algorithms",
                        credithours: "4.00",
                        season: "SM",
                        year: "19",
                        termId: "201950",
                    },
                    {
                        hon: false,
                        subject: "MATH",
                        classId: "3175",
                        name: "GroupTheory",
                        credithours: "4.00",
                        season: "S2",
                        year: "19",
                        termId: "201960",
                    },
                    {
                        hon: false,
                        subject: "MATH",
                        classId: "3331",
                        name: "DifferentialGeometry",
                        credithours: "4.00",
                        season: "FL",
                        year: "19",
                        termId: "202010",
                    },
                    {
                        hon: false,
                        subject: "MATH",
                        classId: "5101",
                        name: "Analysis1",
                        credithours: "4.00",
                        season: "FL",
                        year: "19",
                        termId: "202010",
                    },
                    {
                        hon: false,
                        subject: "MATH",
                        classId: "7241",
                        name: "Probability1",
                        credithours: "4.00",
                        season: "FL",
                        year: "19",
                        termId: "202010",
                    },
                    {
                        hon: false,
                        subject: "PHYS",
                        classId: "2303",
                        name: "ModernPhysics",
                        credithours: "4.00",
                        season: "FL",
                        year: "19",
                        termId: "202010",
                    },
                ],
                nupaths: [
                ],
            },
            requirements: {
                courses: [
                    {
                        subject: "CS",
                        classId: "1210",
                    },
                    {
                        subject: "CS",
                        classId: "2801",
                    },
                    {
                        subject: "CS",
                        classId: "2510",
                    },
                    {
                        subject: "CS",
                        classId: "2511",
                    },
                    {
                        subject: "CS",
                        classId: "2800",
                    },
                    {
                        subject: "CS",
                        classId: "3800",
                    },
                    {
                        subject: "CS",
                        classId: "4300",
                    },
                    {
                        subject: "CS",
                        classId: "4500",
                    },
                    {
                        subject: "CS",
                        classId: "3000",
                    },
                    {
                        subject: "THTR",
                        classId: "1170",
                    },
                    {
                        subject: "MATH",
                        classId: "2341",
                    },
                    {
                        subject: "MATH",
                        classId: "3527",
                    },
                    {
                        subject: "MATH",
                        classId: "3001",
                        classId2: "4999",
                    },
                    {
                        subject: "ENGW",
                        list: [
                            "3302",
                            "3308",
                            "3315",
                        ],
                        num_required: "1",
                    },
                ],
                nupaths: [
                    "WI",
                    "WD",
                    "EX",
                    "CE",
                ],
            },
            data: {
                grad: "05/20/23",
                major: ["Computer Science"],
                year: "2019",
            },
        });
});
