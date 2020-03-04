namespace EliadeAPI.Controllers
{
    using System;
    using System.Collections.Generic;
    using System.IO;
    using System.Text;
    using System.Threading.Tasks;
    using EliadeAPI.Models;
    using Microsoft.AspNetCore.Http;
    using Microsoft.AspNetCore.Mvc;
    using Westwind.AspNetCore.Markdown;

    [Route("api/[controller]")]
    [ApiController]
    public class JobOfferController : Controller
    {
        [HttpPost]
        [Route("upload")]
        public async Task<IActionResult> UploadFile(IFormFile file)
        {
            if(file == null || file.Length == 0)
            {
                return Content("file not selected");
            }

            var htmlName = file.FileName.Replace(".md", ".html");
            var path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", htmlName);

            string html = Markdown.Parse(this.GetStringFromFile(file));

            using (var stream = new FileStream(path, FileMode.Create, FileAccess.Write, FileShare.Write, 4096, true))
            {
                var bytes = Encoding.UTF8.GetBytes(html);
                await stream.WriteAsync(bytes, 0, bytes.Length);
            }

            return Content("File uploaded");
        }

        private string GetStringFromFile(IFormFile file)
        {
            using (var stream = file.OpenReadStream())
            {
                StreamReader reader = new StreamReader(stream);
                return reader.ReadToEnd();
            }
        }

        //[HttpGet("{filename}")]
        //public ActionResult Download(string filename)
        //{
        //    if(filename == null)
        //    {
        //        return Content("filename not present");
        //    }

        //    var path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", filename);
            
        //    try
        //    {
        //        return Content(Markdown.ParseFromFile(path));
        //    }
        //    catch (Exception)
        //    {
        //        return Content("path matches no file");
        //    }
        //}

        [HttpGet("{filename}")]
        public ActionResult Get(string filename)
        {
            if (filename == null)
            {
                return Content("filename not present");
            }

            var path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", filename);

            try
            {
                return Json(new FileModel { Html = Markdown.ParseFromFile(path) });
            }
            catch (Exception)
            {
                return Content("path matches no file");
            }
        }

        private string GetContentType(string path)
        {
            var types = GetMimeTypes();
            var ext = Path.GetExtension(path).ToLowerInvariant();
            return types[ext];
        }

        private Dictionary<string, string> GetMimeTypes()
        {
            return new Dictionary<string, string>
            {
                { ".md", "text/markdown" }
            };
        }
    }
}