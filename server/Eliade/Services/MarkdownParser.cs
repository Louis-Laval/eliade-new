namespace Services
{
    using Westwind.AspNetCore.Markdown;

    public class MarkdownParser : Interfaces.IMarkdownParser
    {
        public string Parse(string filename)
        {
            return Markdown.ParseFromFile(filename);
        }
    }
}
