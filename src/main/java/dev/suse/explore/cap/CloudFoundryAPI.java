package dev.suse.explore.cap;

import org.cloudfoundry.operations.useradmin.CreateUserRequest;
import org.cloudfoundry.operations.organizations.CreateOrganizationRequest;
import org.cloudfoundry.operations.spaces.CreateSpaceRequest;
import org.cloudfoundry.operations.useradmin.SetOrganizationRoleRequest;
import org.cloudfoundry.operations.useradmin.SetSpaceRoleRequest;
import org.cloudfoundry.operations.useradmin.SpaceRole;
import org.cloudfoundry.operations.useradmin.OrganizationRole;
import org.cloudfoundry.operations.CloudFoundryOperations;
import org.cloudfoundry.client.CloudFoundryClient;
import org.cloudfoundry.doppler.DopplerClient;
import org.cloudfoundry.operations.DefaultCloudFoundryOperations;
import org.cloudfoundry.reactor.ConnectionContext;
import org.cloudfoundry.reactor.DefaultConnectionContext;
import org.cloudfoundry.reactor.TokenProvider;
import org.cloudfoundry.reactor.client.ReactorCloudFoundryClient;
import org.cloudfoundry.reactor.doppler.ReactorDopplerClient;
import org.cloudfoundry.reactor.tokenprovider.PasswordGrantTokenProvider;
import org.cloudfoundry.reactor.uaa.ReactorUaaClient;
import org.cloudfoundry.uaa.UaaClient;

import java.util.Random;
import java.lang.StringBuilder;
import reactor.core.publisher.Mono;


public class CloudFoundryAPI {
	private CloudFoundryOperations ops;
	private String uaa_origin;
	
	public CloudFoundryAPI(String apiHost, 
	String username, 
	String password, 
	String org, 
	String space, 
	String uaa_origin){

		DefaultConnectionContext connectionContext = DefaultConnectionContext.builder()
		.apiHost(apiHost)
		.build();

		PasswordGrantTokenProvider tokenProvider = PasswordGrantTokenProvider.builder()
		.password(password)
		.username(username)
		.build();

		this.ops = DefaultCloudFoundryOperations.builder()
		.cloudFoundryClient(ReactorCloudFoundryClient.builder()
			.connectionContext(connectionContext)
			.tokenProvider(tokenProvider)
			.build())
		.dopplerClient(ReactorDopplerClient.builder()
			.connectionContext(connectionContext)
			.tokenProvider(tokenProvider)
			.build())
		.uaaClient(ReactorUaaClient.builder()
			.connectionContext(connectionContext)
			.tokenProvider(tokenProvider)
			.build())
		.organization(org)
		.space(space)
		.build();

		this.uaa_origin = uaa_origin;
	}
	

	private String buildPassword() {
		Random rdm = new Random();

		return rdm.ints(97,122).limit(10).collect(StringBuilder::new, StringBuilder::appendCodePoint, StringBuilder::append).toString();
	}

	//This seems to work but I don't like using an exception to get a real return...
	//Is there a way to check if a user exists without creating it?
	public String userAlreadyExists(String email) {

		String password = buildPassword();

		CreateUserRequest req = CreateUserRequest
			.builder()
			.username(email)
			//.origin(uaa_origin)
			.password(password)
			.build();
		try {
			//Block obviously blocks. But also bubbles any exceptions into the current thread
			ops.userAdmin().create(req).doOnError((Throwable e)->{
				System.err.println("Error creating User " + email);
				System.err.println(e.getMessage());
			}).block();
			return password;
		}catch(IllegalArgumentException e) {
			System.err.println(e.getMessage());
			e.printStackTrace();
			return null;
		}
	}

	public String cleanEmail(String email){
		return email.replaceAll("\\W", "_");
	}

	// TODO: create everything
	// TODO: Better Exception?
	public String buildEnvironmentForUser(String email) throws Exception{
		
		//**********create the org***************
		//create org name from email: foo.bar@bar.com -> foo_bar_bar_com
		String orgname = this.cleanEmail(email);
		System.out.println("Creating org " + orgname + " for user " + email + "...");

		// TODO: replace quota name string with an env variable or something
		CreateOrganizationRequest req = CreateOrganizationRequest.builder().organizationName(orgname).quotaDefinitionName("sandbox").build();
		//Do I need to call .block() in the end? Why if so?
		ops.organizations().create(req).block();


		//**********make user org manager*************
		ops.userAdmin().setOrganizationRole(
				SetOrganizationRoleRequest.builder().organizationName(orgname).organizationRole(OrganizationRole.MANAGER).username(email).build()
				).block();

		//***********create the default spaces************
		// TODO: there is probably an elegant way to fold these into one call somehow
		// TODO: Does the user get roles assigned for these spaces automatically?

		System.out.println("Creating spaces prod and samples for org " + orgname + "...");
		this.createSpace(orgname, "prod");
		this.createSpace(orgname, "samples");


		System.out.println("Creating spaces dev and test for org " + orgname + "...");
		this.createSpace(orgname, "dev");
		this.createSpace(orgname, "test");


		System.out.println("Creating roles MANAGER and DEVELOPER for user " + email + " in dev...");
		this.setSpaceRole(email, orgname, "dev", SpaceRole.MANAGER);
		this.setSpaceRole(email, orgname, "dev", SpaceRole.DEVELOPER);


		System.out.println("Creating roles MANAGER and DEVELOPER for user " + email + " in test...");
		this.setSpaceRole(email, orgname, "test", SpaceRole.MANAGER);
		this.setSpaceRole(email, orgname, "test", SpaceRole.DEVELOPER);
	

		System.out.println("Creating roles MANAGER and DEVELOPER for user " + email + " in prod...");
	    this.setSpaceRole(email, orgname, "prod", SpaceRole.MANAGER);
		this.setSpaceRole(email, orgname, "prod", SpaceRole.DEVELOPER);
	

		System.out.println("Creating roles MANAGER and DEVELOPER for user " + email + " in samples...");
		this.setSpaceRole(email, orgname, "samples", SpaceRole.MANAGER);
	    this.setSpaceRole(email, orgname, "samples", SpaceRole.DEVELOPER);


		//PushApplicationRequest req = PushApplicationRequest.builder().application()

		//TODO: personalize.
		return "https://firstlook.cap.explore.suse.dev";
	}

	private Void createSpace(String org, String space) {
		return ops.spaces().create(
				CreateSpaceRequest.builder().name(space).organization(org).build()
				).doOnError((Throwable e)->{
					System.err.println("Error creating Space" + space);
					System.err.println(e.getMessage());
				}).block();
	}

	private Void setSpaceRole(String username, String org, String space, SpaceRole role){
		return ops.userAdmin().setSpaceRole(
			SetSpaceRoleRequest.builder().organizationName(org).spaceName(space).spaceRole(role).username(username).build()
			).doOnError((Throwable e)->{
				System.err.println("Error creating Role " +space+":"+ role.toString());
				System.err.println(e.getMessage());
			}).block();
	}

}