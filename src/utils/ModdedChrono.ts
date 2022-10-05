import * as chrono from "chrono-node";
import { ParsingContext } from "chrono-node/dist/chrono";
import { ParsingResult } from "chrono-node/dist/results";

const moddedChrono = chrono.casual.clone();
moddedChrono.refiners.push({
  refine: (context: ParsingContext, results: ParsingResult[]) => {
    // If there is no AM/PM (meridiem) specified,
    //  let all time be 12:00 AM.
    results.forEach((result) => {
      if (!result.start.isCertain("meridiem")) {
        result.start.assign("meridiem", 0);
        result.start.assign("hour", 0);
        result.start.assign("minute", 0);
        result.start.assign("second", 0);
      }
    });
    return results;
  },
});

export default moddedChrono;
