namespace Services.Tests
{
    using Microsoft.VisualStudio.TestTools.UnitTesting;

    [TestClass]
    public class MarkdownParserShould
    {
        [TestMethod]
        public void ParseMarkdownIntoHtml()
        {
            MarkdownParser parser = new MarkdownParser();

            Assert.IsTrue(parser.Parse("# Ceci est un test").Contains("Ceci est un test</h1>"));
        }
    }
}
