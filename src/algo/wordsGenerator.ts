import words from "../assets/commonWords.json";

const randomIntFromRange = (min: number, max: number) => {
  const minNorm = Math.ceil(min);
  const maxNorm = Math.floor(max);
  const idx = Math.floor(Math.random() * (maxNorm - minNorm + 1) + minNorm);
  return idx;
};

const wordsGenerator = () => {
  const wordList = [];
  for (let i = 0; i < 200; i++) {
    const rand = randomIntFromRange(0, 550);
    let wordCandidate = (words as any)[rand].val;
    wordList.push({ key: wordCandidate, val: wordCandidate });
  }
  return wordList;
};

export default wordsGenerator;
