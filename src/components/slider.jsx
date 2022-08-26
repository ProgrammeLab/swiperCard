import "./index.css";
// import React from "react";
// import { useDrag } from "@use-gesture/react";
// import { animated, useSpring } from "react-spring";

// export default () => {
//   const targetRef = React.useRef();
//   const [styles, api] = useSpring(() => ({
//     width: 0,
//   }));
//   useDrag(({ last }) => {}, {
//     target: targetRef,
//     pointer: {
//       touch: true,
//     },
//   });
//   return (
//     <animated.div ref={targetRef}>
//       <div className="slider-children">{<Scroll />}</div>
//       <animated.div style={styles}></animated.div>
//     </animated.div>
//   );
// };

import React, { CSSProperties, FC, useLayoutEffect } from "react";
import { useSpring, animated } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";
// import { clamp } from "lodash";
import clsx from "clsx";

import "./style.css";
// import { rubberbandIfOutOfBounds } from "../utils/rubber-band";
// import { getScrollParent, getScrollTop } from "@/utils/scroll";

const prefixCls = "mui-card-group";

export default ({ className, style, children, loadMore, onFinish }) => {
  const [springStyles, api] = useSpring(() => ({ width: 0 }));
  const sliderTarget = React.useRef(null);
  const [status, setStatus] = React.useState("pulling");
  const rootRef = React.useRef(null);
  const loadRef = React.useRef(null);
  const lastLoadingAble = React.useRef(false);
  const windowWidth = window.innerWidth;
  const childWidth = 128;
  // const loadMoreWidth = 48
  // const totalWidth = childWidth * children.length + loadMoreWidth
  /** 滑动更多的距离 */
  const threshold = 48;
  // const safeScroll = -totalWidth + windowWidth

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getWidthByRef = (ref) => {
    return ref?.current?.getBoundingClientRect().width ?? 0;
  };
  const loadMoreWidth = React.useMemo(() => {
    return getWidthByRef(loadRef);
  }, [getWidthByRef]);

  const rootWidth = React.useMemo(() => {
    return getWidthByRef(rootRef);
  }, [getWidthByRef]);

  const totalWidth = React.useMemo(() => {
    // return rootWidth + loadMoreWidth
    return rootWidth;
  }, [loadMoreWidth, rootWidth]);

  const safeScroll = React.useMemo(() => {
    return -totalWidth + windowWidth;
  }, [totalWidth, windowWidth]);

  function projection(initialVelocity) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // const decelerationRate = decelerationRates[rateName] || rateName
    const decelerationRate = 0.98;
    return (initialVelocity * decelerationRate) / (1 - decelerationRate);
  }

  const getScrollLeft = (el = sliderTarget.current) => {
    return el.scrollLeft ?? 0;
  };

  useDrag(
    // eslint-disable-next-line consistent-return
    ({
      movement: [mx],
      active,
      last,
      down,
      offset: [xOffset],
      velocity: [xVelocity],
      direction: [xDir],
      event,
      distance: [xDis],
      // eslint-disable-next-line consistent-return
    }) => {
      // 滚动结束 - 刷新
      if (last) {
        api.start({
          width: 0,
        });
        return;
      }
      // 处理滚动中
      console.log(getScrollLeft(), rootWidth, childWidth, springStyles.width);
      const { target } = event;
      if (!target || !(target instanceof Element)) return;
      // let scrollParent = getScrollParent(target)
      // while (true) {
      //   if (!scrollParent) return
      //   const scrollLeft = getScrollLeft(scrollParent)
      //   if (scrollLeft < rootWidth - windowWidth) {
      //     return
      //   }
      //   if (scrollParent instanceof Window) {
      //     break
      //   }
      //   scrollParent = getScrollParent(scrollParent.parentNode as Element)
      // }
      if (event.cancelable) {
        event.preventDefault();
      }
      event.stopPropagation();
      const width = -mx;
      console.log(xDis);
      api.start({
        width,
      });
    },
    {
      target: sliderTarget,
      axis: "x",
      from: () => [0, 0],
      filterTaps: true,
      enabled: true,
      pointer: {
        touch: true,
      },
    }
  );

  const renderLoadText = () => {
    if (status === "canRelease") {
      return "松开查看更多";
    }
    return "左滑查看更多";
  };

  return (
    <animated.div
      ref={sliderTarget}
      style={{
        width: "100vw",
        whiteSpace: "nowrap",
      }}
      className="v2"
    >
      {/* content */}
      <div
        ref={rootRef}
        style={{
          whiteSpace: "nowrap",
          display: "inline",
        }}
      >
        {/* {children} */}
        <Scroll />
      </div>
      {/* load */}
      <animated.div
        ref={loadRef}
        // className={`${prefixCls}-load`}
        style={{ display: "inline-block", overflow: "hidden", ...springStyles }}
      >
        <span>icon</span>
        {renderLoadText()}
      </animated.div>
    </animated.div>
  );
};

const Scroll = () => {
  const [data, setData] = React.useState([1, 2, 3, 4]);
  return data.map((item) => {
    return <div className={"item"}>{item}</div>;
  });
};
