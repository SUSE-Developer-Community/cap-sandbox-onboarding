package dev.suse.explore.cap;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.view.RedirectView;
import org.cloudfoundry.operations.CloudFoundryOperations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;



@RestController
public class FormController {

	@Autowired
	CloudFoundryAPI client;

	@Autowired
	EmailServiceClient emailer;

	@PostMapping("/addUser")
	public RedirectView index(@ModelAttribute FormInput form, 
			@RequestParam(name = "fail") String onFailure,
			@RequestParam(name = "success") String onSuccess,
			@RequestParam(name = "exists") String onExists) {

		try {
			String email = form.getEmail();

			if (client.userAlreadyExists(email)) {
				return new RedirectView(onExists);
			}

			System.out.println("Building env for new user...");
			String firstlookUrl = client.buildEnvironmentForUser(email);
			System.out.println("Env for new user ready!");

//disabling until things are more stable so that we don't always get a /failed
//			emailer.sendWelcomeEmail(email, firstlookUrl);

		} catch (Exception e) {
			e.printStackTrace();
			return new RedirectView(onFailure);
		}

		return new RedirectView(onSuccess);
	}

}
