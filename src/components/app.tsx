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
import { Slider } from "material-ui";
import * as spline from "@yr/catmull-rom-spline";

interface AppProps {

}

interface AppState {
  machine: Machine,
  wave: ManualWave;
  t: number;
  mouseY: number;
}

export class App extends React.Component<AppProps, AppState> {
  fps = 15;
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

  render() {
    const width = 500;
    const height = 500;
    const vbh = 10;

    return <div style={{
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
        viewBox={`0 ${-vbh / 2} ${this.state.machine.w} ${vbh}`}>
        {//波形
          <path
            fill="transparent"
            stroke="black"
            strokeWidth={0.03}
            d={spline.svgPath(spline.points(utils.range(0, Math.floor(this.state.machine.w / this.rodInterval))
              .map(i => {
                const x = i * this.rodInterval;
                return [x, -waveY(this.state.machine,
                  this.state.wave,
                  this.state.t,
                  x)];
              })))} />
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
    </div>;
  }
}
