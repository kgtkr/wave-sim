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

interface AppProps {

}

interface AppState {
  machine: Machine,
  wave: ManualWave;
  t: number;
}

export class App extends React.Component<AppProps, AppState> {
  fps = 10;
  subs: Subscription[] = [];
  mouseY = 0;
  rodInterval = 0.1;
  rodR = 0.02;

  get updateS() {
    return 1 / this.fps;
  }

  constructor(props: AppProps) {
    super(props);
    this.state = {
      machine: {
        w: 10,
        end: "none",
        r: 0,
        v: 1,
      },
      t: 0,
      wave: new ManualWave(this.updateS)
    };

    this.subs.push(Observable
      .interval(this.updateS * 1000)
      .subscribe(() => this.setState({
        t: this.state.t + this.updateS,
        wave: this.state.wave.add(this.mouseY)
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

    return <svg onMouseMove={e => {
      const y = e.clientY - (e.target as SVGSVGElement).getBoundingClientRect().top;
      this.mouseY = -(y / height * vbh - vbh / 2);
    }} width={width}
      height={height}
      viewBox={`0 ${-vbh / 2} ${this.state.machine.w} ${vbh}`}>
      {utils.range(0, Math.floor(this.state.machine.w / this.rodInterval))
        .map((_, i) => {
          const x = i * this.rodInterval;
          return <circle
            key={i}
            cx={x}
            cy={-waveY(this.state.machine,
              this.state.wave,
              this.state.t,
              x)}
            r={this.rodR} />;
        })}
      <g stroke="green" >
        <line x1={0} y1={-this.mouseY} x2={this.state.machine.w} y2={-this.mouseY} strokeWidth={0.01} />
      </g>
    </svg>;
  }
}
