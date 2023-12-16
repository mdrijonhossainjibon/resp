const { default: axios } = require("axios");


/**
 * Makes an asynchronous API call using Axios.
 *
 * @param {Object} props - The configuration object for the API call.
 * @param {string} props.baseURL - The base URL for the API.
 * @param {string} [props.method="GET"] - The HTTP method for the request (default is "GET").
 * @param {Object} [props.headers] - Additional headers for the request.
 * @param {string} [props.headers.contentType="application/json"] - Content type of the request.
 * @param {Object} [props.body] - The request payload.
 * @param {boolean} [props.headers.contentType==="image"] - Indicates if the content type is "image".
 *
 * @returns {Promise<Object>} - A promise that resolves to an object containing the response status and data.
 */




 const API_CALL = async (props) => {
    const api = axios.create({
      baseURL: props?.baseURL,
    });
  
    const defaultHeaders = {
      "Content-Type": "application/json",
    };
  
    /**
     * Configuration object for the Axios request.
     *
     * @type {Object}
     * @property {string} method - The HTTP method for the request.
     * @property {Object} headers - The headers for the request.
     * @property {Object} data - The request payload.
     */
    const config = {
      ...props,
      data: props.body || undefined,
      headers: {
        ...defaultHeaders,
        ...props?.headers,
      },
    };
  
    try {
      if (props.headers?.contentType === "image") {
        const formData = new FormData();
        formData.append("image", props.body);
        config.data = formData;
      }
  
      /**
       * The Axios response object.
       *
       * @type {Object}
       * @property {number} status - The HTTP status code of the response.
       * @property {Object} response - The data returned by the API.
       */
      const response = await api(config);
  
      return {
        status: response.status,
        response: response.data,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          return {
            status: error.response.status,
            response: error.response.data,
          };
        } else if (error.request) {
          return {
            status: 500,
            response: { message:   "Network error occurred"  },
          };
        } else {
          return {
            status: 500,
            response: { message:   "An error occurred"   },
          };
        }
      } else {
        return {
          status: 500,
          response: { message:  "An error occurred"  },
        };
      }
    }
  };
  

  module.exports = API_CALL