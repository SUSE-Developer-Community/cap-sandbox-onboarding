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
	private CloudFoundryAPI client = CloudFoundryAPI.getInstance();

	@Autowired
	private ApplicationContext context;

	@PostMapping("/addUser")
	public RedirectView index(@ModelAttribute FormInput form, 
			@RequestParam(name = "fail") String onFailure,
			@RequestParam(name = "success") String onSuccess,
			@RequestParam(name = "exists") String onExists) {

		try {
			String email = form.getEmail();

			if (client.userAlreadyExists(context.getBean(CloudFoundryOperations.class), email)) {
				return new RedirectView(onExists);
			}

			String fisrtlookUrl = client.buildEnvironmentForUser(email);

			//email.sendOnboardingEmail(email, firstlookUrl, stratosUrl);

		} catch (Exception e) {
			e.printStackTrace();
			return new RedirectView(onFailure);
		}

		return new RedirectView(onSuccess);
	}

}
