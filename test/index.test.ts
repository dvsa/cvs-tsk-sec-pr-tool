import prBot from "../src";
import { Probot } from "probot";
import nock from "nock";

nock.disableNetConnect();
describe("The pr bot", () => {
  let probot;

  beforeEach(() => {
    probot = new Probot({});
    const app = probot.load(prBot);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    app.app = () => "test";
  });

  test("responds with the correct access token", () => {
    nock("https://api.github.com")
      .post("/app/installations/2/access_tokens")
      .reply(200, { token: "test" });
  });
});
