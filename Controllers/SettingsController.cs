using Microsoft.AspNetCore.Mvc;
using thisispro.Helpers;
using thisispro.Models;

namespace thisispro.Controllers
{
	public class SettingsController : Controller
	{
		private const string SettingsSessionKey = "MailSettings";

		[HttpGet]
		public IActionResult Index()
		{
			var settings = HttpContext.Session.GetObjectFromJson<MailSettings>(SettingsSessionKey) ?? new MailSettings();
			return View(settings);
		}

		[HttpPost]
		[ValidateAntiForgeryToken]
		public IActionResult Index(MailSettings model)
		{
			if (!ModelState.IsValid)
			{
				return View(model);
			}

			HttpContext.Session.SetObjectAsJson(SettingsSessionKey, model);
			TempData["Message"] = "Settings saved successfully.";
			return RedirectToAction("Dashboard", "Mail");
		}
	}
}


