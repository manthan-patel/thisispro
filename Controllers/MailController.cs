using thisispro.Helpers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using OfficeOpenXml;
using MailKit.Net.Smtp;
using MimeKit;
using MailKit.Security;
using thisispro.Models;

namespace thisispro.Controllers
{
    public class MailController : Controller
    {
        private readonly IWebHostEnvironment _env;
        private readonly IConfiguration _config;
        private const string SessionKey = "ExcelData";
        private const string SettingsSessionKey = "MailSettings";

        public MailController(IWebHostEnvironment env, IConfiguration config)
        {
            _env = env;
            _config = config;
        }

        // GET: Dashboard
        public IActionResult Dashboard(string searchTerm)
        {
            var settings = HttpContext.Session.GetObjectFromJson<MailSettings>(SettingsSessionKey);
            if (settings == null)
            {
                TempData["Message"] = "Please configure your SMTP settings first.";
                return RedirectToAction("Index", "Settings");
            }

            var data = HttpContext.Session.GetObjectFromJson<List<Dictionary<string, string>>>(SessionKey)
                       ?? new List<Dictionary<string, string>>();

            if (!string.IsNullOrEmpty(searchTerm))
            {
                searchTerm = searchTerm.ToLower();
                data = data.Where(row => row.Values.Any(v => v != null && v.ToLower().Contains(searchTerm))).ToList();
                ViewBag.SearchTerm = searchTerm;
            }

            return View(data);
        }

        // POST: Upload Excel
        [HttpPost]
        public IActionResult UploadExcel(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                TempData["Message"] = "Please select a valid Excel file.";
                return RedirectToAction("Dashboard");
            }

            var dataList = new List<Dictionary<string, string>>();

            using (var stream = new MemoryStream())
            {
                file.CopyTo(stream);
                using (var package = new ExcelPackage(stream))
                {
                    var worksheet = package.Workbook.Worksheets.FirstOrDefault();
                    if (worksheet == null)
                    {
                        TempData["Message"] = "No worksheet found.";
                        return RedirectToAction("Dashboard");
                    }

                    var rowCount = worksheet.Dimension.Rows;
                    var colCount = worksheet.Dimension.Columns;

                    var headers = new List<string>();
                    for (int col = 1; col <= colCount; col++)
                    {
                        headers.Add(worksheet.Cells[1, col].Text);
                    }

                    for (int row = 2; row <= rowCount; row++)
                    {
                        var rowDict = new Dictionary<string, string>();
                        for (int col = 1; col <= colCount; col++)
                        {
                            rowDict[headers[col - 1]] = worksheet.Cells[row, col].Text;
                        }
                        dataList.Add(rowDict);
                    }
                }
            }

            HttpContext.Session.SetObjectAsJson(SessionKey, dataList);
            TempData["Message"] = "Excel uploaded successfully.";
            return RedirectToAction("Dashboard");
        }

        // POST: SendMail
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> SendMail([FromBody] EmailRecord email)
        {
            try
            {
                var settings = HttpContext.Session.GetObjectFromJson<MailSettings>(SettingsSessionKey);
                if (settings == null)
                {
                    return BadRequest(new { success = false, message = "SMTP settings are missing. Please configure them first." });
                }

                if (!settings.Port.HasValue)
                {
                    return BadRequest(new { success = false, message = "Port number is required. Please configure the SMTP port in settings." });
                }

                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(settings.UserName, settings.MailId));
                message.To.Add(MailboxAddress.Parse(email.Recipient));
                message.Subject = email.Subject;

                var builder = new BodyBuilder
                {
                    HtmlBody = email.Body
                };
                message.Body = builder.ToMessageBody();

                using var smtp = new SmtpClient();
                await smtp.ConnectAsync(settings.SmtpHost, settings.Port.Value, SecureSocketOptions.StartTls);
                // Use MailId (email) for SMTP auth; many providers require the full email as username
                await smtp.AuthenticateAsync(settings.MailId, settings.AppPassword);
                await smtp.SendAsync(message);
                await smtp.DisconnectAsync(true);

                //return Ok(new { success = true, message = "Email sent successfully" });
                return Ok();
            }
            catch (MailKit.Security.AuthenticationException ex)
            {
                return BadRequest(new { success = false, message = "Authentication failed. Please check your email and app password." });
            }
            catch (MailKit.Net.Smtp.SmtpCommandException ex)
            {
                return BadRequest(new { success = false, message = $"SMTP error: {ex.Message}" });
            }
            catch (MailKit.Net.Smtp.SmtpProtocolException ex)
            {
                return BadRequest(new { success = false, message = $"SMTP protocol error: {ex.Message}" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = $"Error sending email: {ex.Message}" });
            }
        }
    }
}