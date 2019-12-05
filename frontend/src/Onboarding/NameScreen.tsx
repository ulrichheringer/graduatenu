import React from "react";
import { withRouter, RouteComponentProps, Link } from "react-router-dom";
import { TextField } from "@material-ui/core";
import { GenericQuestionTemplate } from "./GenericQuestionScreen";
import { NextButton } from "../components/common/NextButton";

interface State {
  textFieldStr: string;
}

class NameComponent extends React.Component<RouteComponentProps, State> {
  constructor(props: RouteComponentProps) {
    super(props);

    this.state = {
      textFieldStr: "",
    };
  }

  onChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({
      textFieldStr: e.target.value,
    });
  }

  render() {
    return (
      <GenericQuestionTemplate question="What is your full name?">
        <TextField
          id="standard-basic"
          value={this.state.textFieldStr}
          onChange={this.onChange.bind(this)}
          placeholder="John Smith"
        />
        <Link
          to={{
            pathname: "/academicYear",
            state: { userData: { fullName: this.state.textFieldStr } },
          }}
          style={{ textDecoration: "none" }}
        >
          <NextButton />
        </Link>
      </GenericQuestionTemplate>
    );
  }
}

export const NameScreen = withRouter(NameComponent);
