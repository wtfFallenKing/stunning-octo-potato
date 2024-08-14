import React, { useEffect, useState, useMemo } from "react";
import wordsGenerator from "./algo/wordsGenerator";
import { Box, Grid, IconButton, Input, Tooltip } from "@mui/material";
import { RestartAlt, Undo } from "@mui/icons-material";
import Stats from "./TypingStats";

const DEFAULT_WORDS_COUNT = 200;

const Typing = ({ textInputRef, handleInputFocus }: any) => {
  const pacingStyle = "caret";
  const [incorrectCharsCount, setIncorrectCharsCount] = useState(0);
  const countDownConstant = 60;
  const [itemsToRender, setItemsToRender] = useState(40);

  const [wordsDict, setWordsDict] = useState(() => {
    return wordsGenerator();
  });

  const words = useMemo(() => {
    return wordsDict.map((e) => e.val);
  }, [wordsDict]);

  const wordSpanRefs: any = useMemo(
    () =>
      Array(words.length)
        .fill(0)
        .map((_) => React.createRef()),
    [words]
  );
  const [countDown, setCountDown] = useState(countDownConstant);
  const [intervalId, setIntervalId] = useState<any>(null);
  const [status, setStatus] = useState("waiting");
  const [currentInput, setcurrentInput] = useState("");
  const [currentWordIndex, setcurrentWordIndex] = useState(0);
  const [currentCharIndex, setcurrentCharIndex] = useState(-1);
  const [prevInput, setPrevInput] = useState("");
  const [wordsCorrect, setWordsCorrect] = useState(new Set());
  const [wordsInCorrect, setWordsInCorrect] = useState(new Set());
  const [inputWordsHistory, setInputWordsHistory] = useState<any>({});
  const [rawKeyStrokes, setRawKeyStrokes] = useState(0);
  const [wpmKeyStrokes, setWpmKeyStrokes] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [statsCharCount, setStatsCharCount] = useState<any>([]);
  const [history, setHistory] = useState<any>({});
  const keyString = currentWordIndex + "." + currentCharIndex;
  const [currentChar, setcurrentChar] = useState("");

  useEffect(() => {
    if (currentWordIndex === DEFAULT_WORDS_COUNT - 1) {
      const generatedEng = wordsGenerator();
      setWordsDict((currentArray) => [...currentArray, ...generatedEng]);
    }
    if (
      currentWordIndex !== 0 &&
      wordSpanRefs[currentWordIndex].current.offsetLeft <
        wordSpanRefs[currentWordIndex - 1].current.offsetLeft
    ) {
      wordSpanRefs[currentWordIndex - 1].current.scrollIntoView();
    } else {
      return;
    }
  }, [currentWordIndex, wordSpanRefs]);

  const start = () => {
    if (status === "finished") {
      setcurrentInput("");
      setPrevInput("");
      setcurrentWordIndex(0);
      setcurrentCharIndex(-1);
      setcurrentChar("");
      setHistory({});
      setInputWordsHistory({});
      setWordsCorrect(new Set());
      setWordsInCorrect(new Set());
      setStatus("waiting");
      textInputRef.current.focus();
    }

    if (status !== "started") {
      setStatus("started");
      let intervalId = setInterval(() => {
        setCountDown((prevCountdown: number) => {
          if (prevCountdown === 0) {
            clearInterval(intervalId);
            const currentCharExtraCount = Object.values(history)
              .filter((e) => typeof e === "number")
              .reduce((a, b) => a + b, 0);

            const currentCharCorrectCount = Object.values(history).filter(
              (e) => e === true
            ).length;

            const currentCharIncorrectCount = Object.values(history).filter(
              (e) => e === false
            ).length;

            const currentCharMissingCount = Object.values(history).filter(
              (e) => e === undefined
            ).length;

            const currentCharAdvancedCount =
              currentCharCorrectCount +
              currentCharMissingCount +
              currentCharIncorrectCount;

            const accuracy =
              currentCharCorrectCount === 0
                ? 0
                : (currentCharCorrectCount / currentCharAdvancedCount) * 100;

            setStatsCharCount([
              accuracy,
              currentCharCorrectCount,
              currentCharIncorrectCount,
              currentCharMissingCount,
              currentCharAdvancedCount,
              currentCharExtraCount,
            ]);

            checkPrev();
            setStatus("finished");

            return countDownConstant;
          } else {
            return prevCountdown - 1;
          }
        });
      }, 1000);
      setIntervalId(intervalId);
    }
  };

  const UpdateInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (status === "finished") {
      return;
    }
    setcurrentInput(e.target.value);
    inputWordsHistory[currentWordIndex] = e.target.value.trim();
    setInputWordsHistory(inputWordsHistory);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const key = e.key;
    const keyCode = e.keyCode;

    if (status === "started") {
      setRawKeyStrokes(rawKeyStrokes + 1);
      if (keyCode >= 65 && keyCode <= 90) {
        setWpmKeyStrokes(wpmKeyStrokes + 1);
      }
    }

    if (keyCode === 20) {
      e.preventDefault();
      return;
    }

    if (keyCode >= 16 && keyCode <= 18) {
      e.preventDefault();
      return;
    }

    if (keyCode === 9) {
      e.preventDefault();
      return;
    }

    if (status === "finished") {
      setcurrentInput("");
      setPrevInput("");
      return;
    }

    if (wpmKeyStrokes !== 0 && countDownConstant - countDown !== 0) {
      const currentWpm =
        (wpmKeyStrokes / 5 / (countDownConstant - countDown)) * 60.0;
      setWpm(currentWpm);
    }

    if (status !== "started" && status !== "finished") {
      start();
    }

    if (keyCode === 32) {
      const prevCorrectness = checkPrev();
      if (prevCorrectness === true || prevCorrectness === false) {
        if (
          words[currentWordIndex].split("").length >
          currentInput.split("").length
        ) {
          setIncorrectCharsCount((prev) => prev + 1);
        }
        setcurrentInput("");
        setcurrentWordIndex(currentWordIndex + 1);
        setcurrentCharIndex(-1);
        return;
      } else {
        return;
      }
    } else if (keyCode === 8) {
      delete history[keyString];
      if (currentCharIndex < 0) {
        if (wordsInCorrect.has(currentWordIndex - 1)) {
          const prevInputWord = inputWordsHistory[currentWordIndex - 1];
          setcurrentInput(prevInputWord + " ");
          setcurrentCharIndex(prevInputWord.length - 1);
          setcurrentWordIndex(currentWordIndex - 1);
          setPrevInput(prevInputWord);
        }
        return;
      }
      setcurrentCharIndex(currentCharIndex - 1);
      setcurrentChar("");
      return;
    } else {
      setcurrentCharIndex(currentCharIndex + 1);
      setcurrentChar(key);
      return;
    }
  };

  const getExtraCharClassName = (i: number, idx: number, extra: string) => {
    if (
      // pacingStyle === "caret" &&
      currentWordIndex === i &&
      idx === extra.length - 1
    ) {
      return "caret-extra-char-right-error";
    }
    return "error-char";
  };

  const getExtraCharsDisplay = (word: string, i: number) => {
    let input = inputWordsHistory[i];
    if (!input) {
      input = currentInput.trim();
    }
    if (i > currentWordIndex) {
      return null;
    }
    if (input.length <= word.length) {
      return null;
    } else {
      const extra = input.slice(word.length, input.length).split("");
      history[i] = extra.length;
      return extra.map((c: string, idx: number) => (
        <span key={idx} className={getExtraCharClassName(i, idx, extra)}>
          {c}
        </span>
      ));
    }
  };

  const checkPrev = () => {
    const wordToCompare = words[currentWordIndex];
    const currentInputWithoutSpaces = currentInput.trim();
    const isCorrect = wordToCompare === currentInputWithoutSpaces;
    if (!currentInputWithoutSpaces || currentInputWithoutSpaces.length === 0) {
      return null;
    }
    if (isCorrect) {
      // console.log("detected match");
      wordsCorrect.add(currentWordIndex);
      wordsInCorrect.delete(currentWordIndex);
      let inputWordsHistoryUpdate = { ...inputWordsHistory };
      inputWordsHistoryUpdate[currentWordIndex] = currentInputWithoutSpaces;
      setInputWordsHistory(inputWordsHistoryUpdate);
      setPrevInput("");

      setWpmKeyStrokes(wpmKeyStrokes + 1);
      return true;
    } else {
      wordsInCorrect.add(currentWordIndex);
      wordsCorrect.delete(currentWordIndex);
      let inputWordsHistoryUpdate = { ...inputWordsHistory };
      inputWordsHistoryUpdate[currentWordIndex] = currentInputWithoutSpaces;
      setInputWordsHistory(inputWordsHistoryUpdate);
      setPrevInput(prevInput + " " + currentInputWithoutSpaces);
      return false;
    }
  };

  const getWordClassName = (wordIdx: number) => {
    if (wordsInCorrect.has(wordIdx)) {
      if (currentWordIndex === wordIdx) {
        if (pacingStyle === "pulse") {
          return "word error-word active-word";
        } else {
          return "word error-word active-word-no-pulse";
        }
      }
      return "word error-word";
    } else {
      if (currentWordIndex === wordIdx) {
        // if (pacingStyle === "pulse") {
          // return "word active-word";
        // } else {
          return "word active-word-no-pulse";
        // }
      }
      return "word";
    }
  };

  useEffect(() => {
    if (status !== "started") return;
    const word = words[currentWordIndex];
    const char = word.split("")[currentCharIndex];

    if (char !== currentChar && char !== undefined)
      return setIncorrectCharsCount((prev) => prev + 1);
  }, [currentChar, status, currentCharIndex]);

  useEffect(() => {
    // console.log("incorrectCharsCount:", incorrectCharsCount);
  }, [incorrectCharsCount]);

  const getCharClassName = (
    wordIdx: number,
    charIdx: number,
    char: string,
    word: string
  ) => {
    const keyString = wordIdx + "." + charIdx;
    if (
      // pacingStyle === "caret" &&
      wordIdx === currentWordIndex &&
      charIdx === currentCharIndex + 1 &&
      status !== "finished"
    ) {
      return "caret-char-left";
    }
    if (history[keyString] === true) {
      if (
        // pacingStyle === "caret" &&
        wordIdx === currentWordIndex &&
        word.length - 1 === currentCharIndex &&
        charIdx === currentCharIndex &&
        status !== "finished"
      ) {
        return "caret-char-right-correct";
      }
      return "correct-char";
    }
    if (history[keyString] === false) {
      if (
        // pacingStyle === "caret" &&
        wordIdx === currentWordIndex &&
        word.length - 1 === currentCharIndex &&
        charIdx === currentCharIndex &&
        status !== "finished"
      ) {
        return "caret-char-right-error";
      }
      return "error-char";
    }
    if (
      wordIdx === currentWordIndex &&
      charIdx === currentCharIndex &&
      currentChar &&
      status !== "finished"
    ) {
      if (char === currentChar) {
        history[keyString] = true;
        return "correct-char";
      } else {
        history[keyString] = false;
        return "error-char";
      }
    } else {
      if (wordIdx < currentWordIndex) {
        history[keyString] = undefined;
      }
      return "char";
    }
  };

  function reset(isRedo: boolean) {
    setStatus("waiting");
    if (!isRedo) {
      setWordsDict(wordsGenerator());
    }
    setCountDown(countDownConstant);
    clearInterval(intervalId);
    setWpm(0);
    setRawKeyStrokes(0);
    setWpmKeyStrokes(0);
    setcurrentInput("");
    setPrevInput("");
    setIntervalId(null);
    setcurrentWordIndex(0);
    setcurrentCharIndex(-1);
    setcurrentChar("");
    setHistory({});
    setInputWordsHistory({});
    setWordsCorrect(new Set());
    setWordsInCorrect(new Set());
    textInputRef.current.focus();
    wordSpanRefs[0].current.scrollIntoView();
  }

  const renderResetButton = () => {
    return (
      <div className="restart-button" key="restart-button">
        <Grid container justifyContent="center" alignItems="center">
          <Box display="flex" flexDirection="row">
            <IconButton
              aria-label="redo"
              color="secondary"
              size="medium"
              onClick={() => {
                reset(true);
              }}
            >
              <Tooltip title="redo">
                <Undo />
              </Tooltip>
            </IconButton>
            <IconButton
              aria-label="restart"
              color="secondary"
              size="medium"
              onClick={() => {
                reset(false);
              }}
            >
              <Tooltip title="restart">
                <RestartAlt />
              </Tooltip>
            </IconButton>
          </Box>
        </Grid>
      </div>
    );
  };

  const startIndex = 0;
  const endIndex = startIndex + itemsToRender;
  const currentWords = words.slice(startIndex, endIndex);
  useEffect(() => {
    const distanceToEnd = currentWords.length - 1 - currentWordIndex;
    if (distanceToEnd === 20) {
      setItemsToRender((prev) => prev + 20);
    }
  }, [currentWordIndex]);

  return (
    <Box onClick={handleInputFocus}>
      <Box
        className="type-box"
        sx={{ visibility: status === "finished" ? "hidden" : "visible" }}
      >
        <Box className="words">
          {currentWords.map((word, i) => {
            return (
              <span
                key={i}
                ref={wordSpanRefs[i]}
                className={getWordClassName(i)}
              >
                {word.split("").map((char: string, idx: number) => (
                  <span
                    key={"word" + idx}
                    className={getCharClassName(i, idx, char, word)}
                  >
                    {char}
                  </span>
                ))}
                {getExtraCharsDisplay(word, i)}
              </span>
            );
          })}
        </Box>
      </Box>
      <Box className="stats">
        <Stats
          status={status}
          wpm={wpm}
          setIncorrectCharsCount={setIncorrectCharsCount}
          incorrectCharsCount={incorrectCharsCount}
          countDown={countDown}
          countDownConstant={countDownConstant}
          statsCharCount={statsCharCount}
          rawKeyStrokes={rawKeyStrokes}
          wpmKeyStrokes={wpmKeyStrokes}
          renderResetButton={renderResetButton}
        ></Stats>
        {status !== "finished" && renderResetButton()}
      </Box>
      <Input
        sx={{ opacity: 0, filter: "opacity(0)" }}
        ref={textInputRef}
        type="text"
        onKeyDown={(e) => handleKeyDown(e)}
        value={currentInput}
        onChange={(e) => UpdateInput(e)}
      />
    </Box>
  );
};

export default Typing;
