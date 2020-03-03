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

	// @Autowired
	// CloudFoundryAPI client;

	@Autowired
	EmailServiceClient emailer;

	@PostMapping("/addUser")
	public RedirectView index(@ModelAttribute FormInput form, 
			@RequestParam(name = "fail") String onFailure,
			@RequestParam(name = "success") String onSuccess,
			@RequestParam(name = "exists") String onExists) {
		CloudFoundryAPI client = new CloudFoundryAPI(
			System.getenv("CF_API"), 
			System.getenv("CF_ADMIN_USER"), 
			System.getenv("CF_ADMIN_PASS"), 
			System.getenv("DEFAULT_ORG"), 
			System.getenv("DEFAULT_SPACE"), 
			System.getenv("UAA_ORIGIN")
			);
		try {
			String email = form.getEmail();
			
			String password = client.userAlreadyExists(email);

			if (password == null) {
				return new RedirectView(onExists);
			}

			this.createEnvironmentInThread(client, email, password);
		} catch (Exception e) {
			e.printStackTrace();
			return new RedirectView(onFailure);
		}

		return new RedirectView(onSuccess);
	}

	private void createEnvironmentInThread(CloudFoundryAPI client, String email, String password) {

		new Thread(){
			public void run(){
				try {
					
				System.out.println("Building env for new user...");
				String firstlookUrl = client.buildEnvironmentForUser(email);
				System.out.println("Env for new user ready!");

				emailer.sendWelcomeEmail(email, password, firstlookUrl);
				} catch(Exception e){
					e.printStackTrace();
				}
			}
		}.start();

	}

}
