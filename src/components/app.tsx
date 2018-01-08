import * as React from "react";
import {
  Machine,
  waveY,
  ManualWave
} from "../models";
import {
  Subscription,
  Observable
} from "rxjs";
import * as utils from "../utils";
import {
  Slider,
  SelectField,
  MenuItem,
  Card,
  CardHeader,
  Table,
  TableBody,
  TableRow,
  TableRowColumn,
  TableHeader,
  TableHeaderColumn
} from "material-ui";
import * as spline from "@yr/catmull-rom-spline";
import {
  getMuiTheme,
  darkBaseTheme,
  MuiThemeProvider,
} from "material-ui/styles";

interface AppProps {

}

interface AppState {
  machine: Machine,
  wave: ManualWave;
  t: number;
  mouseY: number;
}

export class App extends React.Component<AppProps, AppState> {
  fps = 10;
  subs: Subscription[] = [];
  rodInterval = 0.05;
  rodR = 0.02;

  get updateS() {
    return 1 / this.fps;
  }

  constructor(props: AppProps) {
    super(props);
    this.state = {
      machine: {
        w: 10,
        end: "fixed",
        r: 0,
        v: 1
      },
      t: 0,
      wave: new ManualWave(this.updateS),
      mouseY: 0
    };

    this.subs.push(Observable
      .interval(this.updateS * 1000)
      .subscribe(() => this.setState({
        t: this.state.t + this.updateS,
        wave: this.state.wave.add(this.state.mouseY)
      })));

    this.subs.push(Observable
      .interval(1000)
      .subscribe(() => {
      }));
  }

  componentWillUnmount() {
    this.subs.forEach(s => s.unsubscribe());
  }

  pahtD(): [string, string, string] {
    const [p, p1, p2] = utils.range(0, Math.floor(this.state.machine.w / this.rodInterval))
      .reduce<[[number, number][], [number, number][], [number, number][]]>((r, i) => {
        const x = i * this.rodInterval;
        const [y, y1, y2] = waveY(this.state.machine,
          this.state.wave,
          this.state.t,
          x);
        r[0].push([x, -y]);
        r[1].push([x, -y1]);
        r[2].push([x, -y2]);
        return r;
      }, [[], [], []]);
    return [
      spline.svgPath(spline.points(p)),
      spline.svgPath(spline.points(p1)),
      spline.svgPath(spline.points(p2)),
    ];
  }

  render() {
    const width = 500;
    const height = 500;
    const vbh = 10;

    return <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
      <div>
        <Card style={{ padding: "1rem" }}>
          <div style={{
            display: "flex"
          }}>
            <Slider
              axis="y"
              value={this.state.mouseY}
              onChange={(_e, v) => this.setState({ mouseY: v })}
              min={-vbh / 2}
              max={vbh / 2}
              step={vbh / 100}
              style={{ height }}
              sliderStyle={{ margin: 0 }} />
            <svg width={width}
              height={height}
              viewBox={`0 ${-vbh / 2} ${this.state.machine.w} ${vbh}`}
              style={{ backgroundColor: "#fff" }}>
              {//波形
                (() => {
                  const [d, d1, d2] = this.pahtD();
                  return <g>
                    <path
                      fill="transparent"
                      stroke="red"
                      strokeWidth={0.02}
                      d={d1} />
                    <path
                      fill="transparent"
                      stroke="blue"
                      strokeWidth={0.02}
                      d={d2} />
                    <path
                      fill="transparent"
                      stroke="black"
                      strokeWidth={0.03}
                      d={d} />
                  </g>;
                })()
              }
              <g stroke="blue" >
                {
                  //縦グリッド
                  utils.range(0, Math.floor(this.state.machine.w))
                    .map(x => <line
                      key={x}
                      x1={x}
                      y1={vbh / 2}
                      x2={x}
                      y2={-vbh / 2}
                      strokeWidth={0.01} />)}
                {
                  //横グリッド
                  utils.range(-Math.floor(vbh / 2), Math.floor(vbh / 2))
                    .map(y => <line
                      key={y}
                      x1={0}
                      y1={y}
                      x2={this.state.machine.w}
                      y2={y}
                      strokeWidth={0.01} />)}
                {
                  //中央線
                }
                <line x1={0} y1={0} x2={this.state.machine.w} y2={0} strokeWidth={0.02} />
              </g>
              {
                //波生成線
              }
              <g stroke="red" >
                <line
                  x1={0}
                  y1={-this.state.mouseY}
                  x2={this.state.machine.w}
                  y2={-this.state.mouseY}
                  strokeWidth={0.01} />
              </g>
            </svg>
          </div>
        </Card>
        <Card style={{ padding: "1rem" }}>
          <CardHeader title="ステータス" />
          <Table selectable={false}>
            <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
              <TableRow>
                <TableHeaderColumn>名</TableHeaderColumn>
                <TableHeaderColumn>値</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox={false}>
              <TableRow>
                <TableRowColumn>経過時間</TableRowColumn>
                <TableRowColumn>{Math.floor(this.state.t)}[s]</TableRowColumn>
              </TableRow>
              <TableRow>
                <TableRowColumn>波速</TableRowColumn>
                <TableRowColumn>{this.state.machine.v}[m/s]</TableRowColumn>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
        <Card style={{ padding: "1rem" }}>
          <CardHeader title="設定" />
          <SelectField
            floatingLabelText="端"
            value={this.state.machine.end}
            onChange={(_e, _i, v) => this.setState({
              ...this.state,
              machine: {
                ...this.state.machine,
                end: v
              }
            })}
          >
            <MenuItem value="fixed" primaryText="固定端" />
            <MenuItem value="free" primaryText="自由端" />
            <MenuItem value="none" primaryText="反射しない" />
          </SelectField>
        </Card>
      </div>
    </MuiThemeProvider>;
  }
}
