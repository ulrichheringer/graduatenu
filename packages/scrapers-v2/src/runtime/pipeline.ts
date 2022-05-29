import { filterByEntryType, flattenCatalogHierarchy } from "../utils";
import { fetchAndTokenizeHTML } from "../tokenize/tokenize";
import { classifyCatalogEntries } from "../classify/classify";
import { scrapeMajorLinks } from "../urls/urls";
import { CatalogEntryType } from "../classify/types";
import { Err, Ok, Result, ResultType } from "@graduate/common";

enum Phase {
  Urls,
  Flatten,
  Classify,
  Filter,
  Tokenize,
}

type Pipeline<T> = [Phase[], Result<T, unknown[]>];
const createPipeline = <T>(input: T): Pipeline<T> => [[], Ok(input)];

const addPhase =
  <Input extends any[], Output>(
    phase: Phase,
    next: ((...args: Input) => Promise<Output>) | ((...args: Input) => Output)
  ) =>
  async (input: Pipeline<Input>): Promise<Pipeline<[Output]>> => {
    const [trace, result] = input;
    const newTrace = [...trace, phase];
    if (result.type === ResultType.Ok) {
      try {
        // todo: debug why this is not actually catching
        const applied = await next(...result.ok);
        return [newTrace, Ok([applied])];
      } catch (e) {
        return [newTrace, Err([e])];
      }
    }
    return [trace, result];
  };

export const runPipeline = async () => {
  // todo: make this not break when request fails
  Promise.resolve(createPipeline([2021, 2022] as [number, number]))
    .then(addPhase(Phase.Urls, scrapeMajorLinks))
    .then(addPhase(Phase.Flatten, flattenCatalogHierarchy))
    .then(addPhase(Phase.Classify, classifyCatalogEntries))
    .then(
      addPhase(Phase.Filter, (typedUrls) =>
        filterByEntryType(typedUrls, [CatalogEntryType.Major])
      )
    )
    .then(
      addPhase(Phase.Tokenize, (filteredUrls) =>
        Promise.all(filteredUrls.map(({ url }) => fetchAndTokenizeHTML(url)))
      )
    )
    .then((pipeline) => {
      // todo: log the result => errors if they exist, otherwise result
      const [phases, result] = pipeline;
      console.log(`completed ${phases.length} phases!`);
    });
};
