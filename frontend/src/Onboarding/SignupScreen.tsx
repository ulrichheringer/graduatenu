import React from "react";
import { connect } from "react-redux";
import { withRouter, RouteComponentProps, Link } from "react-router-dom";
import styled from "styled-components";
import { TextField, Button } from "@material-ui/core";
import { AppState } from "../state/reducers/state";
import { Major } from "../models/types";

const Wrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  height: 100vh;
`;

const Title = styled.div`
  margin-top: 96px;
  font-style: normal;
  font-weight: bold;
  font-size: 24px;
  line-height: 28px;
  color: #000000;
`;

const Subtitle = styled.div`
  margin-top: 8px;
  margin-bottom: 0;
  font-family: Roboto;
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 16px;
`;

const Box = styled.div`
  border: 1px solid white;
  width: 500px;
  align-items: center;
  display: flex;
  flex-direction: column;
`;

interface SignupScreenReduxProps {
  fullName: string;
  academicYear: number;
  graduationYear: number;
  major?: Major;
  planStr?: string;
}

interface SignupScreenState {
  emailStr: string;
  passwordStr: string;
  confirmPasswordStr: string;
  beenEditedEmail: boolean;
  beenEditedPassword: boolean;
  beenEditedConfirmPassword: boolean;
  validEmail: boolean;
  errorEmail?: string;
  validPassword: boolean;
  validConfirm: boolean;
}

class SignupScreenComponent extends React.Component<
  SignupScreenReduxProps,
  SignupScreenState
> {
  constructor(props: SignupScreenReduxProps) {
    super(props);

    this.state = {
      emailStr: "",
      passwordStr: "",
      confirmPasswordStr: "",
      beenEditedEmail: false,
      beenEditedPassword: false,
      beenEditedConfirmPassword: false,
      validEmail: true,
      errorEmail: undefined,
      validPassword: true,
      validConfirm: true,
    };
  }

  onChangeEmail(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({
      emailStr: e.target.value,
      beenEditedEmail: true,
    });
  }

  onChangePassword(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({
      passwordStr: e.target.value,
      beenEditedPassword: true,
    });
  }

  onChangeConfirmPassword(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({
      confirmPasswordStr: e.target.value,
      beenEditedConfirmPassword: true,
    });
  }

  submit() {
    const validEmail: boolean = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
      this.state.emailStr
    );
    const validPassword: boolean = this.state.passwordStr.length >= 6;
    const validConfirm: boolean =
      this.state.passwordStr === this.state.confirmPasswordStr;

    this.setState({
      validEmail,
      validPassword,
      validConfirm,
    });

    if (validEmail && validPassword && validConfirm) {
      const user = {
        user: {
          email: this.state.emailStr,
          password: this.state.passwordStr,
          username: this.props.fullName,
          academic_year: this.props.academicYear,
          graduation_year: this.props.graduationYear,
        },
      };
      console.log(JSON.stringify(user));

      fetch(`/api/users`, {
        method: "POST",
        body: JSON.stringify(user),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then(response => response.json())
        .then(response => {
          if (response.errors) {
            this.setState({
              errorEmail: response.errors.email,
            });
          } else {
            // this.props.history.push()
          }
        });
    }
  }

  /**
   * Renders the email text field
   */
  renderEmailTextField(textFieldStr: string, beenEdited: boolean) {
    return (
      <TextField
        id="outlined-basic"
        label="Email"
        variant="outlined"
        value={textFieldStr}
        onChange={this.onChangeEmail.bind(this)}
        placeholder="presidentaoun@northeastern.edu"
        error={
          (textFieldStr.length === 0 && beenEdited) || !this.state.validEmail
        }
        style={{
          marginTop: 48,
          marginBottom: 16,
          minWidth: 326,
        }}
        helperText={
          (!this.state.validEmail && "Please enter a valid email") ||
          ("" && (!beenEdited || textFieldStr.length !== 0)) ||
          (textFieldStr.length === 0 &&
            beenEdited &&
            "Please enter a valid email")
        }
        type="email"
      />
    );
  }

  /**
   * Renders the password text field
   */
  renderPasswordTextField(textFieldStr: string, beenEdited: boolean) {
    return (
      <TextField
        id="outlined-basic"
        label="Password"
        variant="outlined"
        value={textFieldStr}
        onChange={this.onChangePassword.bind(this)}
        error={
          (textFieldStr.length === 0 && beenEdited) ||
          !this.state.validPassword ||
          !this.state.validConfirm
        }
        style={{
          marginBottom: 16,
          minWidth: 326,
        }}
        helperText={
          (!this.state.validPassword &&
            "Password must be at least 6 characters") ||
          (!this.state.validConfirm && "Passwords do not match") ||
          ("" && (!beenEdited || textFieldStr.length !== 0)) ||
          (textFieldStr.length === 0 &&
            beenEdited &&
            "Please enter a valid password")
        }
        type="password"
      />
    );
  }

  /**
   * Renders the confirm password text field
   */
  renderConfirmPasswordTextField(textFieldStr: string, beenEdited: boolean) {
    return (
      <TextField
        id="outlined-basic"
        label="Confirm Password"
        variant="outlined"
        value={textFieldStr}
        onChange={this.onChangeConfirmPassword.bind(this)}
        error={
          (textFieldStr.length === 0 && beenEdited) || !this.state.validConfirm
        }
        style={{
          marginBottom: 16,
          minWidth: 326,
        }}
        helperText={
          (!this.state.validConfirm && "Passwords do not match") ||
          ("" && (!beenEdited || textFieldStr.length !== 0)) ||
          (textFieldStr.length === 0 &&
            beenEdited &&
            "Please enter a valid password")
        }
        type="password"
      />
    );
  }

  render() {
    return (
      <Wrapper>
        <Title>Sign Up</Title>
        <Box>
          {this.renderEmailTextField(
            this.state.emailStr,
            this.state.beenEditedEmail
          )}
          {this.renderPasswordTextField(
            this.state.passwordStr,
            this.state.beenEditedPassword
          )}
          {this.renderConfirmPasswordTextField(
            this.state.confirmPasswordStr,
            this.state.beenEditedConfirmPassword
          )}
        </Box>

        <Subtitle>
          Already a member? Log in <a href="#">here</a> or{" "}
          <a href="#">continue as guest</a>
        </Subtitle>
        <Button
          variant="contained"
          color="secondary"
          style={{
            maxWidth: "100px",
            maxHeight: "36px",
            minWidth: "100px",
            minHeight: "36px",
            backgroundColor: "#EB5757",
            marginTop: "26px",
            marginBottom: 12,
          }}
          onClick={this.submit.bind(this)}
        >
          Sign Up
        </Button>
      </Wrapper>
    );
  }
}

/**
 * Callback to be passed into connect, to make properties of the AppState available as this components props.
 * @param state the AppState
 */
const mapStateToProps = (state: AppState) => ({
  fullName: state.user.fullName,
  academicYear: state.user.academicYear,
  graduationYear: state.user.graduationYear,
  major: state.user.major,
  planStr: state.user.planStr,
});

/**
 * Convert this React component to a component that's connected to the redux store.
 * When rendering the connecting component, the props assigned in mapStateToProps, do not need to
 * be passed down as props from the parent component.
 */
export const SignupScreen = connect(mapStateToProps)(SignupScreenComponent);
