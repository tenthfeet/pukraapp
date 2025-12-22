import emailjs from '@emailjs/browser';

interface EmailResponse {
  success: boolean;
  message: string;
}

class EmailService {
  private serviceId = 'service_w1td76c';
  private userId = '9IiQILbseS_yDnazv';
  private accessToken = 'kCHEpAdFXjN7C86MY2plY';
  private templates = {
    appointment: 'template_cs39cld',
    registration: 'template_pkvba0w',
  };

  constructor() {
    emailjs.init(this.userId);
  }

  async sendEmail(
    type: 'appointment' | 'registration',
    data: Record<string, string>,
  ): Promise<EmailResponse> {
    if (!this.templates[type]) {
      return {
        success: false,
        message: `Invalid email type '${type}'`,
      };
    }

    try {
      const templateParams = this.getTemplateParams(type, data);

      const response = await emailjs.send(
        this.serviceId,
        this.templates[type],
        templateParams,
      );

      return {
        success: true,
        message: `${type} email sent successfully`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to send email: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      };
    }
  }

  private getTemplateParams(
    type: string,
    data: Record<string, string>,
  ): Record<string, string> {
    switch (type) {
      case 'appointment':
        return {
          patient_name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          date: data.date || '',
          time: data.time || '',
          symptoms: data.symptoms || '',
          description: data.description || '',
        };
      case 'registration':
        return {
          name: data.name || '',
          email: data.email || '',
        };
      default:
        return {};
    }
  }
}

export default new EmailService();
