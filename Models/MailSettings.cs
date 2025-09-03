using System.ComponentModel.DataAnnotations;

namespace thisispro.Models
{
	public class MailSettings
	{
		[Required]
		[EmailAddress]
		public string MailId { get; set; }

		[Required]
		public string UserName { get; set; }

		[Required]
		[DataType(DataType.Password)]
		public string AppPassword { get; set; }

		[Range(1, 65535)]
		public int? Port { get; set; }

		[Required]
		public string SmtpHost { get; set; }
	}
}


