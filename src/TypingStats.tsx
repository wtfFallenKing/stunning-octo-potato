import { useEffect, useState } from "react";
import { Tooltip } from "@mui/material";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as TooltipChart,
  ResponsiveContainer,
  Bar,
  ComposedChart,
} from "recharts";
import { red } from "@mui/material/colors";

const Stats = ({
  status,
  wpm,
  countDown,
  countDownConstant,
  statsCharCount,
  rawKeyStrokes,
  wpmKeyStrokes,
  renderResetButton,
  setIncorrectCharsCount,
  incorrectCharsCount,
}: any) => {
  const roundedWpm = Math.round(
    (wpmKeyStrokes / 5 / (countDownConstant - countDown)) * 60.0
  );

  const roundedRawWpm = Math.round(
    (rawKeyStrokes / 5 / (countDownConstant - countDown)) * 60.0
  );
  const initialTypingTestHistory = [
    {
      wpm: 0,
      rawWpm: 0,
      time: 0,
      error: 0,
    },
  ];

  const [typingTestHistory, setTypingTestHistory] = useState(
    initialTypingTestHistory
  );

  const language = localStorage.getItem("language");

  const accuracy = Math.round(statsCharCount[0]);

  const data = typingTestHistory.map((history) => {
    return {
      wpm: history.wpm,
      rawWpm: history.rawWpm,
      time: history.time, // Use the time property from history
      error: history.error,
    };
  });

  useEffect(() => {
    // Reset history when user starts playing again
    if (status === "started") {
      setTypingTestHistory(initialTypingTestHistory);
    }
  }, [status]);

  useEffect(() => {
    if (status === "started" && countDown < countDownConstant) {
      let shouldRecord = false;
      let increment = 1;

      switch (countDownConstant) {
        case 90:
        case 60:
          shouldRecord = countDown % 5 === 0;
          increment = 5;
          break;
        case 30:
        case 15:
          shouldRecord = true;
          increment = 1;
          break;
        default:
          shouldRecord = true;
          increment = 1;
      }

      if (shouldRecord) {
        const newTime = typingTestHistory.length * increment;

        setTypingTestHistory((prevTypingTestHistory) => [
          ...prevTypingTestHistory,
          {
            wpm: roundedWpm,
            rawWpm: roundedRawWpm,
            time: newTime,
            error: incorrectCharsCount,
          },
        ]);

        setIncorrectCharsCount(0);
      }
    }
  }, [countDown]);

  const primaryStatsTitleStyles = {
    color: "#D1C5C0",
    marginBlock: 0,
    marginBottom: "6px",
    fontSize: "20px",
  };

  const primaryStatsValueStyles = {
    marginBlock: 0,
    fontSize: "36px",
    color: "#CB1DCD",
  };

  const statsTitleStyles = {
    color: "#D1C5C0",
    marginBlock: 0,
    marginBottom: "6px",
    fontWeight: "bold",
    fontSize: "16px",
  };

  const statsValueStyles = {
    marginBlock: 0,
  };

  const tooltipStyles = {
    fontSize: "14px",
    lineHeight: "6px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  const getFormattedLanguageLanguageName = (value: any) => {
    switch (value) {
      case "ENGLISH_MODE":
        return "eng";
      case "CHINESE_MODE":
        return "chn";
      default:
        return "eng";
    }
  };

  const renderCharStats = () => (
    <Tooltip
      title={
        <span style={{ whiteSpace: "pre-line" }}>
          correct/incorrect/missing/extra <br /> extras are recorded even if
          deleted.
        </span>
      }
    >
      <div>
        <p style={statsTitleStyles}>Characters</p>
        <h2 style={statsValueStyles}>
          <span className="correct-char-stats">{statsCharCount[1]}</span>/
          <span className="incorrect-char-stats">{statsCharCount[2]}</span>/
          <span className="missing-char-stats">{statsCharCount[3]}</span>/
          <span className="correct-char-stats">{statsCharCount[4]}</span>/
          <span className="incorrect-char-stats">{statsCharCount[5]}</span>
        </h2>
      </div>
    </Tooltip>
  );

  const renderIndicator = (color: string) => {
    return (
      <span
        style={{ backgroundColor: color, height: "12px", width: "24px" }}
      ></span>
    );
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const payloadData = payload[0].payload;
      return (
        <div
          className="custom-tooltip"
          style={{
            paddingInline: "8px",
            paddingBlock: "2px",
          }}
        >
          <p className="label" style={{ fontSize: "12px", fontWeight: "bold" }}>
            {`Time: ${label} s`}
          </p>
          <p className="desc" style={tooltipStyles}>
            {renderIndicator(red[400])}
            {`Errors: ${payloadData.error}`}
          </p>
          <p className="desc" style={tooltipStyles}>
            {renderIndicator("#D1C5C0")}
            {`Raw WPM: ${payloadData.rawWpm}`}
          </p>
          <p className="desc" style={tooltipStyles}>
            {renderIndicator("#CB1DCD")}
            {`WPM: ${payloadData.wpm}`}
          </p>
        </div>
      );
    }

    return null;
  };

  const renderAccuracy = () => (
    <div style={{ marginTop: "16px" }}>
      <h2 style={primaryStatsTitleStyles}>ACC</h2>
      <h1 style={primaryStatsValueStyles}>{accuracy}%</h1>
    </div>
  );

  const renderRawKpm = () => (
    <div>
      <p style={statsTitleStyles}>KPM</p>
      <h2 style={statsValueStyles}>
        {Math.round((rawKeyStrokes / countDownConstant) * 60.0)}
      </h2>
    </div>
  );

  const renderLanguage = () => (
    <div>
      <p style={statsTitleStyles}>Test Mode</p>
      <h2 style={statsValueStyles}>
        {getFormattedLanguageLanguageName(language)}
      </h2>
    </div>
  );

  const renderTime = () => (
    <div>
      <p style={statsTitleStyles}>Time</p>
      <h2 style={statsValueStyles}>{countDownConstant} s</h2>
    </div>
  );

  const renderWpm = () => (
    <div>
      <h2 style={primaryStatsTitleStyles}>WPM</h2>
      <h1 style={primaryStatsValueStyles}>
        {Math.round(
          data.map((e) => e.wpm).reduce((a, b) => a + b, 0) / (data.length - 1)
        )}
      </h1>
    </div>
  );

  const Chart = () => (
    <ResponsiveContainer
      width="100%"
      minHeight={200}
      maxHeight={200}
      height="100%"
    >
      <ComposedChart
        width={"100%"}
        height={"100%"}
        data={data.filter((d) => d.time !== 0)}
        margin={{
          top: 12,
          right: 12,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid
          vertical={false}
          horizontal={false}
          stroke={"#CB1DCD"}
          opacity={0.15}
        />
        <XAxis
          dataKey="time"
          stroke={"#CB1DCD"}
          tickMargin={10}
          opacity={0.25}
        />
        <YAxis stroke={"#CB1DCD"} tickMargin={10} opacity={0.25} />
        <TooltipChart cursor content={<CustomTooltip />} />{" "}
        <Line
          type="monotone"
          dataKey="rawWpm"
          stroke={"#D1C5C0"}
          dot={false}
          activeDot={false}
        />
        <Line
          type="monotone"
          dataKey="wpm"
          stroke={"#CB1DCD"}
          dot={false}
          activeDot={false}
        />
        <Bar dataKey="error" barSize={12} fill={`${red[400]}`} />
      </ComposedChart>
    </ResponsiveContainer>
  );

  return (
    <>
      {status !== "finished" && (
        <>
          <h3>{countDown} s</h3>
          <h3>WPM: {Math.round(wpm)}</h3>
        </>
      )}

      {status === "finished" && (
        <div className="stats-overlay">
          <section className="stats-chart">
            <section className="stats-header">
              <div>
                {renderWpm()}
                {renderAccuracy()}
              </div>
              {Chart()}
            </section>
            <section className="stats-footer">
              {renderLanguage()}
              {renderRawKpm()}
              {renderCharStats()}
              {renderTime()}
            </section>
            <section>{renderResetButton()}</section>
          </section>
        </div>
      )}
    </>
  );
};

export default Stats;
