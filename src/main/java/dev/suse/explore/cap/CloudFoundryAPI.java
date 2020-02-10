package dev.suse.explore.cap;

import org.cloudfoundry.client.CloudFoundryClient;
import org.cloudfoundry.doppler.DopplerClient;
import org.cloudfoundry.operations.DefaultCloudFoundryOperations;
import org.cloudfoundry.reactor.ConnectionContext;
import org.cloudfoundry.reactor.DefaultConnectionContext;
import org.cloudfoundry.reactor.TokenProvider;
import org.cloudfoundry.reactor.client.ReactorCloudFoundryClient;
import org.cloudfoundry.reactor.doppler.ReactorDopplerClient;
import org.cloudfoundry.reactor.routing.ReactorRoutingClient;
import org.cloudfoundry.reactor.tokenprovider.PasswordGrantTokenProvider;
import org.cloudfoundry.reactor.uaa.ReactorUaaClient;
import org.cloudfoundry.routing.RoutingClient;
import org.cloudfoundry.uaa.UaaClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.cloudfoundry.operations.CloudFoundryOperations;

@Component
public class CloudFoundryAPI {


@Bean
DefaultConnectionContext connectionContext(@Value("${CF_API}") String apiHost) {
    return DefaultConnectionContext.builder()
        .apiHost(apiHost)
        .build();
}

@Bean
PasswordGrantTokenProvider tokenProvider(@Value("${CF_ADMIN_USER}") String username,
                                         @Value("${CF_ADMIN_PASS}") String password) {
    return PasswordGrantTokenProvider.builder()
        .password(password)
        .username(username)
        .build();
}


@Bean
ReactorCloudFoundryClient cloudFoundryClient(ConnectionContext connectionContext, TokenProvider tokenProvider) {
    return ReactorCloudFoundryClient.builder()
        .connectionContext(connectionContext)
        .tokenProvider(tokenProvider)
        .build();
}

@Bean
ReactorDopplerClient dopplerClient(ConnectionContext connectionContext, TokenProvider tokenProvider) {
    return ReactorDopplerClient.builder()
        .connectionContext(connectionContext)
        .tokenProvider(tokenProvider)
        .build();
}

@Bean
ReactorUaaClient uaaClient(ConnectionContext connectionContext, TokenProvider tokenProvider) {
    return ReactorUaaClient.builder()
        .connectionContext(connectionContext)
        .tokenProvider(tokenProvider)
        .build();
}

@Bean
DefaultCloudFoundryOperations cloudFoundryOperations(CloudFoundryClient cloudFoundryClient,
                                                     DopplerClient dopplerClient,
                                                     UaaClient uaaClient,
                                                     @Value("${DEFAULT_ORG}") String organization,
                                                     @Value("${DEFAULT_SPACE}") String space) {
    return DefaultCloudFoundryOperations.builder()
            .cloudFoundryClient(cloudFoundryClient)
            .dopplerClient(dopplerClient)
            .uaaClient(uaaClient)
            .organization(organization)
            .space(space)
            .build();
}

private CloudFoundryAPI(){

}

  // TODO: Not sure if this needs to be singleton. Feel free to edit as needed or remove comment
  private static CloudFoundryAPI instance = null;
  public static CloudFoundryAPI getInstance() {
    if(instance==null){
      instance = new CloudFoundryAPI();
    }
    return instance;
  }

  // TODO: Checks if user exists and returns 
  public boolean userAlreadyExists(CloudFoundryOperations cloudFoundryOperations, String email) {

    CreateUserRequest

    cloudFoundryOperations.userAdmin().createUser()

    return false;
  }

  // TODO: create everything
  // TODO: Better Exception?
  public String buildEnvironmentForUser(String email) throws Exception{

    //TODO: personalize.
    return "https://firstlook.cap.explore.suse.dev";
  }

}