export const environment = {
  production: false,
  // Each backend microservice runs on its own port (see application.properties in each repo)
  filesApiUrl: 'http://localhost:8081/api/files',     // GoogleDrive service
  foldersApiUrl: 'http://localhost:8082/api/folders', // folder-service
  searchApiUrl: 'http://localhost:8083/api/search',   // Search-service
};
