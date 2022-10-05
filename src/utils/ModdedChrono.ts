import * as chrono from "chrono-node";
import { ParsingContext } from "chrono-node/dist/chrono";
import { ParsingResult } from "chrono-node/dist/results";

const moddedChrono = chrono.casual.clone();
moddedChrono.refiners.push({
  refine: (context: ParsingContext, results: ParsingResult[]) => {
    // If there is no AM/PM (meridiem) specified,
    // usually PM
    results.forEach((result) => {
      const hour = result.start.get('hour') || 0
      if (!result.start.isCertain('meridiem') && hour >= 1 && hour <= 5) {
        result.start.assign('meridiem', 1);
        result.start.assign('hour', hour + 12);
      }
    });
    return results;
  },
});

export default moddedChrono;
