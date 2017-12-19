import * as Im from "immutable";

export function waveY(machine: Machine, wave: Wave, t: number, x: number) {
  if (x < 0) {
    return 0;
  } else if (x <= machine.w) {
    // 普通の波のY座標
    const y1 = wave.y(t - x / machine.v);

    // 反射波のY座標
    const y2 = machine.end === "none" ? 0
      : (() => {
        const y = wave.y(t - (x + (machine.w - x) * 2) / machine.v);
        return machine.end === "free" ? y : -y;
      })();
    // TODO:抵抗
    return y1 + y2;
  } else {
    return 0;
  }
}

export interface Machine {
  // 装置の幅
  w: number;
  // 反射しない/固定端/自由端
  end: "none" | "fixed" | "free";
  // 抵抗。1m進むのに減少する高さの割合
  r: number;
  // 波の速さ
  v: number;
}

export abstract class Wave {
  protected abstract getY(t: number): number;
  y(t: number) {
    if (t < 0) {
      return 0;
    } else {
      return this.getY(t);
    }
  }
}

export class EmptyWave extends Wave {
  getY() {
    return 0;
  }
}

export class SupWave extends Wave {
  constructor(public waves: Im.Set<Wave>) {
    super();
  }

  getY(t: number) {
    return this.waves
      .map(w => w.y(t))
      .reduce((a, b) => a + b, 0);
  }
}

export class CosWave extends Wave {
  getY(t: number) {
    return Math.cos(t);
  }
}

export class ManualWave extends Wave {
  constructor(public interval: number,
    public list = Im.List<number>()) {
    super();
  }

  getY(t: number) {
    return this.list.get(t / this.interval) || 0;
  }

  add(y: number) {
    return new ManualWave(this.interval, this.list.push(y));
  }
}
