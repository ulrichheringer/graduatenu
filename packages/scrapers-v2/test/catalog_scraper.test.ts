import { scrapeMajorDataFromCatalog } from "../src/catalog_scraper";

describe("Scrap catalog page", () => {
  test("CS & Game Dev matches snapshot", async () => {
    const result = await scrapeMajorDataFromCatalog(
      "https://catalog.northeastern.edu/undergraduate/computer-information-science/computer-information-science-combined-majors/computer-science-game-development-bs/#programrequirementstext"
    );

    expect(result).toMatchSnapshot();
  });

  test("business", async () => {
    const url =
      "https://catalog.northeastern.edu/undergraduate/business/business-administration-bsba/#programrequirementstext";
    const result = await scrapeMajorDataFromCatalog(url);
    expect(result).toMatchSnapshot();
  });
});
