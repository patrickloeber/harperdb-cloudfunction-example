'use strict';

const customValidation = require('../helpers/example');
const sendMail = require('../helpers/mail');

// eslint-disable-next-line no-unused-vars,require-await
module.exports = async (server, { hdbCore, logger }) => {
  // GET, WITH NO preValidation AND USING hdbCore.requestWithoutAuthentication
  // BYPASSES ALL CHECKS: DO NOT USE RAW USER-SUBMITTED VALUES IN SQL STATEMENTS
  server.route({
    url: '/',
    method: 'GET',
    handler: (request) => {
      request.body= {
        operation: 'sql',
        sql: 'SELECT * FROM workout_repo.workouts'
      };
      return hdbCore.requestWithoutAuthentication(request);
    }
  });

  // POST, WITH STANDARD PASS-THROUGH BODY, PAYLOAD AND HDB AUTHENTICATION
  server.route({
    url: '/',
    method: 'POST',
    preValidation: (request) => customValidation(request, logger),
    handler: async (request) => { 
      // get workout today
      var workout_today = await hdbCore.requestWithoutAuthentication({
        body: {
          operation: 'sql',
          sql: 'SELECT * FROM workout_repo.workout_today where id = 0'
        }
      });
      workout_today = workout_today[0];

      logger.info(workout_today);

      // get all workouts
      const workouts = await hdbCore.requestWithoutAuthentication({
        body: {
          operation: 'sql',
          sql: 'SELECT * FROM workout_repo.workouts'
        }
      });

      // set new workout
      let n = workouts.length;
      if (n > 1)
      {
        var idx = Math.floor(Math.random() * n);
        var workout_new = workouts[idx];
        while (workout_new['video_id'] == workout_today['video_id'])
        {
          idx = Math.floor(Math.random() * n);
          workout_new = workouts[idx];
        }
        workout_today = workout_new;

        workout_today['id'] = 0;
        
        await hdbCore.requestWithoutAuthentication({
          body: {
            operation: 'update',
            schema: 'workout_repo',
            table: 'workout_today',
            records: [workout_today],
          }
        });
      }

      await sendMail(request, logger, workout_today)

      return workout_today;
    }
  });
};
