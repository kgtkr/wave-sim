import * as React from "react";
import {
  RaisedButton,
  SelectField,
  MenuItem,
  TextField
} from "material-ui";

interface ConfigProps {
  onSubmit: (value: ConfigState) => void,
  default: ConfigState
}

interface ConfigState {
  end: "none" | "fixed" | "free",
  v: number
}

export class Config extends React.Component<ConfigProps, ConfigState>{
  constructor(props: ConfigProps) {
    super(props);
    this.state = props.default;
  }

  render() {
    return <form>
      <div>
        <SelectField
          floatingLabelText="端"
          value={this.state.end}
          onChange={(_e, _i, v) => this.setState({
            ...this.state,
            end: v
          })}
        >
          <MenuItem value="fixed" primaryText="固定端" />
          <MenuItem value="free" primaryText="自由端" />
          <MenuItem value="none" primaryText="反射しない" />
        </SelectField>
      </div>
      <div>
        <TextField floatingLabelText="波速"
          value={this.state.v}
          onChange={(_, v) => {
            const n = +v;
            if (n > 0) {
              this.setState({ ...this.state, v: n });
            }
          }} />
      </div>
      <div>
        <RaisedButton label="OK" onClick={() => this.props.onSubmit(this.state)} />
      </div>
    </form>;
  }
}